import { randomInt, randomUUID } from "crypto";
import { IRedisCacheRepository } from "../../../../infra/redis/redis-cache.repository";
import { IMailProvider } from "../../../../infra/providers/MailProvider/models/IMailProvider";
import { getTwoFactorEmailTemplate } from "./emails/two-factor.email";
import { CustomError } from "../../../../errors/custom.error";

export interface Generate2FAParams {
  userId: string;
  businessInfoUuid: string;
  email: string;
  userName?: string;
  name?: string;
}

export interface Generate2FAResult {
  require_2fa: true;
  temp_token: string;
  email_masked: string;
  expires_in_seconds: number;
}

export interface Stored2FAPayload {
  userId: string;
  businessInfoUuid: string;
  email: string;
  userName: string;
  name: string;
  code: string;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
}

export interface Verify2FAResult {
  success: boolean;
  userId?: string;
  businessInfoUuid?: string;
  email?: string;
  userName?: string;
  name?: string;
  error?: string;
  attemptsLeft?: number;
  attemptsExceeded?: boolean;
}

export interface Resend2FAResult {
  success: boolean;
  temp_token: string;
  email_masked: string;
  expires_in_seconds: number;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

export class TwoFactorAuthService {
  private readonly AUTH_EXPIRATION_SECONDS = 600; // 10 minutos
  private readonly COOLDOWN_SECONDS = 60; // 1 minuto
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private readonly redisRepository: IRedisCacheRepository,
    private readonly mailProvider: IMailProvider
  ) {}

  /**
   * Gera um código de 6 dígitos, armazena no Redis com TTL de 10 min
   * e envia via e-mail corporativo.
   */
  async generateAndSend(params: Generate2FAParams): Promise<Generate2FAResult> {
    if (!params.email) {
      throw new CustomError("E-mail é obrigatório para envio do código de autenticação.", 400);
    }

    const code = randomInt(100000, 1000000).toString();
    const tempToken = randomUUID();
    const authKey = `2fa:auth:${tempToken}`;
    const cooldownKey = `2fa:cooldown:${params.userId}`;

    const payload: Stored2FAPayload = {
      userId: params.userId,
      businessInfoUuid: params.businessInfoUuid,
      email: params.email,
      userName: params.userName || "",
      name: params.name || params.userName || "Usuário",
      code,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      createdAt: Date.now(),
    };

    // Salva no Redis com expiração de 10 minutos
    await this.redisRepository.set(authKey, JSON.stringify(payload), this.AUTH_EXPIRATION_SECONDS);

    // Registra cooldown de reenvio (60s)
    await this.redisRepository.set(cooldownKey, "1", this.COOLDOWN_SECONDS);

    // Dispara e-mail com template estilizado
    const emailBody = getTwoFactorEmailTemplate(payload.name, code);
    const senderAddress = process.env.MAIL_ACCOUNT_NOREPLY_USER || "nao-responda@correct.com.br";

    await this.mailProvider.sendMail({
      to: params.email,
      subject: "Seu Código de Verificação de Acesso - Syscorrect",
      body: emailBody,
      from: {
        name: "Syscorrect Segurança",
        address: senderAddress,
      },
    });

    console.log(`[TwoFactorAuthService] Código 2FA gerado e enviado para: ${maskEmail(params.email)} [tempToken: ${tempToken}]`);

    return {
      require_2fa: true,
      temp_token: tempToken,
      email_masked: maskEmail(params.email),
      expires_in_seconds: this.AUTH_EXPIRATION_SECONDS,
    };
  }

  /**
   * Valida o código de 6 dígitos informado pelo usuário.
   */
  async verify(tempToken: string, code: string): Promise<Verify2FAResult> {
    if (!tempToken || !code) {
      return { success: false, error: "Token temporário e código são obrigatórios." };
    }

    const authKey = `2fa:auth:${tempToken}`;
    const rawData = await this.redisRepository.get(authKey);

    if (!rawData) {
      return {
        success: false,
        error: "Código expirado ou sessão inválida. Por favor, faça login novamente.",
      };
    }

    const payload: Stored2FAPayload = JSON.parse(rawData);

    // Validação do código
    if (payload.code !== code.trim()) {
      payload.attempts += 1;

      if (payload.attempts >= payload.maxAttempts) {
        // Bloqueia sessão temporária ao esgotar tentativas
        await this.redisRepository.del(authKey);
        return {
          success: false,
          error: "Número máximo de tentativas excedido. Por favor, faça login novamente.",
          attemptsExceeded: true,
        };
      }

      // Atualiza tentativas no Redis mantendo o TTL restante
      const elapsedSeconds = Math.floor((Date.now() - payload.createdAt) / 1000);
      const remainingSeconds = Math.max(1, this.AUTH_EXPIRATION_SECONDS - elapsedSeconds);
      await this.redisRepository.set(authKey, JSON.stringify(payload), remainingSeconds);

      const attemptsLeft = payload.maxAttempts - payload.attempts;
      return {
        success: false,
        error: `Código incorreto. Você tem mais ${attemptsLeft} tentativa(s).`,
        attemptsLeft,
      };
    }

    // Código correto: consome o token imediatamente (uso único)
    await this.redisRepository.del(authKey);

    return {
      success: true,
      userId: payload.userId,
      businessInfoUuid: payload.businessInfoUuid,
      email: payload.email,
      userName: payload.userName,
      name: payload.name,
    };
  }

  /**
   * Reenvia um novo código para o mesmo tempToken, respeitando cooldown de 60 segundos.
   */
  async resend(tempToken: string): Promise<Resend2FAResult> {
    if (!tempToken) {
      throw new CustomError("Token temporário é obrigatório.", 400);
    }

    const authKey = `2fa:auth:${tempToken}`;
    const rawData = await this.redisRepository.get(authKey);

    if (!rawData) {
      throw new CustomError("Sessão de verificação expirada. Faça login novamente.", 400);
    }

    const payload: Stored2FAPayload = JSON.parse(rawData);

    // Valida cooldown contra spam
    const cooldownKey = `2fa:cooldown:${payload.userId}`;
    const inCooldown = await this.redisRepository.get(cooldownKey);

    if (inCooldown) {
      throw new CustomError("Aguarde 1 minuto antes de solicitar um novo código.", 429);
    }

    // Gera novo código e reseta tentativas
    const newCode = randomInt(100000, 1000000).toString();
    payload.code = newCode;
    payload.attempts = 0;
    payload.createdAt = Date.now();

    await this.redisRepository.set(authKey, JSON.stringify(payload), this.AUTH_EXPIRATION_SECONDS);
    await this.redisRepository.set(cooldownKey, "1", this.COOLDOWN_SECONDS);

    // Dispara novo e-mail
    const emailBody = getTwoFactorEmailTemplate(payload.name, newCode);
    const senderAddress = process.env.MAIL_ACCOUNT_NOREPLY_USER || "nao-responda@correct.com.br";

    await this.mailProvider.sendMail({
      to: payload.email,
      subject: "Novo Código de Verificação de Acesso - Syscorrect",
      body: emailBody,
      from: {
        name: "Syscorrect Segurança",
        address: senderAddress,
      },
    });

    console.log(`[TwoFactorAuthService] Código reenviado com sucesso para: ${maskEmail(payload.email)}`);

    return {
      success: true,
      temp_token: tempToken,
      email_masked: maskEmail(payload.email),
      expires_in_seconds: this.AUTH_EXPIRATION_SECONDS,
    };
  }
}
