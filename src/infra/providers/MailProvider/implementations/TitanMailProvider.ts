import nodemailer, { Transporter } from 'nodemailer';
import { IMailProvider, ISendMailDTO } from '../models/IMailProvider';

export class TitanMailProvider implements IMailProvider {
  private transporters: Map<string, Transporter> = new Map();

  constructor() {
    const host = process.env.MAIL_HOST;
    const port = parseInt(process.env.MAIL_PORT || '465', 10);
    const secure = process.env.MAIL_SECURE === 'true';

    if (!host) throw new Error('[TitanMailProvider] MAIL_HOST não definido.');

    // --- CONFIGURAÇÃO DAS CONTAS ---

    // 1. Conta "Não Responda"
    if (process.env.MAIL_ACCOUNT_NOREPLY_USER && process.env.MAIL_ACCOUNT_NOREPLY_PASS) {
        this.createTransporter(
            host, port, secure,
            process.env.MAIL_ACCOUNT_NOREPLY_USER,
            process.env.MAIL_ACCOUNT_NOREPLY_PASS
        );
    }

    // 2. Conta "TI"
    if (process.env.MAIL_ACCOUNT_TI_USER && process.env.MAIL_ACCOUNT_TI_PASS) {
        this.createTransporter(
            host, port, secure,
            process.env.MAIL_ACCOUNT_TI_USER,
            process.env.MAIL_ACCOUNT_TI_PASS
        );
    }

    // 3. Conta "Suporte" (exemplo futuro)
    if (process.env.MAIL_ACCOUNT_SUPPORT_USER && process.env.MAIL_ACCOUNT_SUPPORT_PASS) {
        this.createTransporter(
            host, port, secure,
            process.env.MAIL_ACCOUNT_SUPPORT_USER,
            process.env.MAIL_ACCOUNT_SUPPORT_PASS
        );
    }

    if (this.transporters.size === 0) {
        console.warn('[TitanMailProvider] AVISO: Nenhuma conta de e-mail foi configurada com sucesso.');
    } else {
        console.log(`[TitanMailProvider] Inicializado com ${this.transporters.size} contas: ${Array.from(this.transporters.keys()).join(', ')}`);
    }
  }

  /**
   * Método auxiliar para criar e registrar um transportador
   */
  private createTransporter(host: string, port: number, secure: boolean, user: string, pass: string) {
      try {
        const transporter = nodemailer.createTransport({
            host, port, secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
        // Salva no mapa usando o e-mail como chave
        this.transporters.set(user, transporter);
      } catch (error) {
          console.error(`[TitanMailProvider] Erro ao configurar conta ${user}:`, error);
      }
  }


  async sendMail({ to, subject, body, from }: ISendMailDTO): Promise<void> {
    // REGRA CRUCIAL: O UseCase OBRIGATORIAMENTE deve informar quem é o remetente.
    if (!from || !from.address) {
        throw new Error('[TitanMailProvider] Erro: O remetente (from.address) é obrigatório para que o sistema saiba qual conta usar.');
    }

    const senderAddress = from.address;

    // Busca o transportador correto para este remetente
    const transporter = this.transporters.get(senderAddress);

    if (!transporter) {
        // Se tentaram usar um e-mail que não configuramos no construtor (não estava no .env)
        throw new Error(`[TitanMailProvider] Erro: Nenhuma credencial SMTP configurada para o remetente: ${senderAddress}. Verifique o .env.`);
    }

    try {
      await transporter.sendMail({
        from: {
            name: from.name, // O nome pode ser qualquer um
            address: senderAddress // O endereço TEM que bater com a autenticação do transporter
        },
        to,
        subject,
        html: body,
      });

      console.log(`[TitanMailProvider] E-mail enviado para: ${to} | Usando conta: ${senderAddress}`);

    } catch (error: any) {
        // Log detalhado do erro SMTP
        console.error(`[TitanMailProvider] Falha SMTP ao enviar como ${senderAddress}: ${error.message}`);
        if (error.response) {
            console.error(`[TitanMailProvider] Resposta do servidor: ${error.response}`);
        }
        throw new Error(`Falha no envio de e-mail: ${error.message}`);
    }
  }
}