import { TwoFactorAuthService, maskEmail } from "../two-factor-auth.service";
import { IRedisCacheRepository } from "../../../../../infra/redis/redis-cache.repository";
import { IMailProvider } from "../../../../../infra/providers/MailProvider/models/IMailProvider";
import { CustomError } from "../../../../../errors/custom.error";

describe("TwoFactorAuthService & maskEmail", () => {
  let redisMock: jest.Mocked<IRedisCacheRepository>;
  let mailProviderMock: jest.Mocked<IMailProvider>;
  let service: TwoFactorAuthService;

  beforeEach(() => {
    redisMock = {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(undefined),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(undefined),
    };

    mailProviderMock = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };

    service = new TwoFactorAuthService(redisMock, mailProviderMock);
  });

  describe("maskEmail helper", () => {
    it("should mask standard email addresses", () => {
      expect(maskEmail("joao.silva@empresa.com.br")).toBe("jo***a@empresa.com.br");
      expect(maskEmail("admin@syscorrect.com")).toBe("ad***n@syscorrect.com");
    });

    it("should mask short usernames correctly", () => {
      expect(maskEmail("ab@test.com")).toBe("a***@test.com");
      expect(maskEmail("a@test.com")).toBe("a***@test.com");
    });

    it("should return unchanged if invalid email", () => {
      expect(maskEmail("invalid-email")).toBe("invalid-email");
      expect(maskEmail("")).toBe("");
    });
  });

  describe("generateAndSend", () => {
    it("should generate a 6-digit code, store in Redis with 600s TTL and send email", async () => {
      const result = await service.generateAndSend({
        userId: "user-123",
        businessInfoUuid: "bus-456",
        email: "gestor@empresa.com",
        name: "Gestor RH",
      });

      expect(result.require_2fa).toBe(true);
      expect(result.temp_token).toBeDefined();
      expect(result.email_masked).toBe("ge***r@empresa.com");
      expect(result.expires_in_seconds).toBe(600);

      // Verify Redis set calls
      expect(redisMock.set).toHaveBeenCalledTimes(2);

      // Call 1: Auth payload with 600s TTL
      const [authKey, rawPayload, authTtl] = redisMock.set.mock.calls[0];
      expect(authKey).toBe(`2fa:auth:${result.temp_token}`);
      expect(authTtl).toBe(600);

      const parsedPayload = JSON.parse(rawPayload);
      expect(parsedPayload.userId).toBe("user-123");
      expect(parsedPayload.businessInfoUuid).toBe("bus-456");
      expect(parsedPayload.email).toBe("gestor@empresa.com");
      expect(parsedPayload.code).toMatch(/^\d{6}$/);
      expect(parsedPayload.attempts).toBe(0);
      expect(parsedPayload.maxAttempts).toBe(3);

      // Call 2: Cooldown key with 60s TTL
      const [cooldownKey, cooldownVal, cooldownTtl] = redisMock.set.mock.calls[1];
      expect(cooldownKey).toBe("2fa:cooldown:user-123");
      expect(cooldownVal).toBe("1");
      expect(cooldownTtl).toBe(60);

      // Verify Email sent
      expect(mailProviderMock.sendMail).toHaveBeenCalledTimes(1);
      const mailCall = mailProviderMock.sendMail.mock.calls[0][0];
      expect(mailCall.to).toBe("gestor@empresa.com");
      expect(mailCall.subject).toContain("Código de Verificação");
      expect(mailCall.body).toContain(parsedPayload.code);
    });

    it("should throw CustomError if email is not provided", async () => {
      await expect(
        service.generateAndSend({
          userId: "user-123",
          businessInfoUuid: "bus-456",
          email: "",
        })
      ).rejects.toThrow(CustomError);
    });
  });

  describe("verify", () => {
    it("should return error if tempToken or code is missing", async () => {
      const res1 = await service.verify("", "123456");
      expect(res1.success).toBe(false);

      const res2 = await service.verify("token-123", "");
      expect(res2.success).toBe(false);
    });

    it("should return error if session is expired or not found in Redis", async () => {
      redisMock.get.mockResolvedValueOnce(null);

      const res = await service.verify("token-123", "123456");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Código expirado");
    });

    it("should succeed and delete Redis token when code is correct", async () => {
      const stored = {
        userId: "user-123",
        businessInfoUuid: "bus-456",
        email: "gestor@empresa.com",
        userName: "gestor",
        name: "Gestor RH",
        code: "654321",
        attempts: 0,
        maxAttempts: 3,
        createdAt: Date.now(),
      };
      redisMock.get.mockResolvedValueOnce(JSON.stringify(stored));

      const res = await service.verify("token-123", "654321");
      expect(res.success).toBe(true);
      expect(res.userId).toBe("user-123");
      expect(res.email).toBe("gestor@empresa.com");
      expect(redisMock.del).toHaveBeenCalledWith("2fa:auth:token-123");
    });

    it("should increment attempts and return remaining count when code is wrong", async () => {
      const stored = {
        userId: "user-123",
        businessInfoUuid: "bus-456",
        email: "gestor@empresa.com",
        userName: "gestor",
        name: "Gestor RH",
        code: "654321",
        attempts: 0,
        maxAttempts: 3,
        createdAt: Date.now(),
      };
      redisMock.get.mockResolvedValueOnce(JSON.stringify(stored));

      const res = await service.verify("token-123", "111111");
      expect(res.success).toBe(false);
      expect(res.attemptsLeft).toBe(2);
      expect(res.error).toContain("2 tentativa(s)");

      // Updated payload in Redis with attempts = 1
      expect(redisMock.set).toHaveBeenCalledTimes(1);
      const updatedPayload = JSON.parse(redisMock.set.mock.calls[0][1]);
      expect(updatedPayload.attempts).toBe(1);
    });

    it("should block and delete session when max attempts are exceeded", async () => {
      const stored = {
        userId: "user-123",
        businessInfoUuid: "bus-456",
        email: "gestor@empresa.com",
        userName: "gestor",
        name: "Gestor RH",
        code: "654321",
        attempts: 2,
        maxAttempts: 3,
        createdAt: Date.now(),
      };
      redisMock.get.mockResolvedValueOnce(JSON.stringify(stored));

      const res = await service.verify("token-123", "111111");
      expect(res.success).toBe(false);
      expect(res.attemptsExceeded).toBe(true);
      expect(res.error).toContain("Número máximo de tentativas excedido");
      expect(redisMock.del).toHaveBeenCalledWith("2fa:auth:token-123");
    });
  });

  describe("resend", () => {
    it("should throw error if tempToken is not provided or expired", async () => {
      await expect(service.resend("")).rejects.toThrow(CustomError);

      redisMock.get.mockResolvedValueOnce(null);
      await expect(service.resend("token-expired")).rejects.toThrow("Sessão de verificação expirada");
    });

    it("should throw 429 CustomError if cooldown is active", async () => {
      const stored = {
        userId: "user-123",
        businessInfoUuid: "bus-456",
        email: "gestor@empresa.com",
        userName: "gestor",
        name: "Gestor RH",
        code: "123456",
        attempts: 1,
        maxAttempts: 3,
        createdAt: Date.now(),
      };
      redisMock.get.mockResolvedValueOnce(JSON.stringify(stored)); // authKey
      redisMock.get.mockResolvedValueOnce("1"); // cooldown active

      await expect(service.resend("token-123")).rejects.toMatchObject({
        statusCode: 429,
        message: expect.stringContaining("Aguarde 1 minuto"),
      });
    });

    it("should generate new code, reset attempts, set new cooldown and send email when cooldown is inactive", async () => {
      const stored = {
        userId: "user-123",
        businessInfoUuid: "bus-456",
        email: "gestor@empresa.com",
        userName: "gestor",
        name: "Gestor RH",
        code: "123456",
        attempts: 2,
        maxAttempts: 3,
        createdAt: Date.now() - 70000,
      };
      redisMock.get.mockResolvedValueOnce(JSON.stringify(stored)); // authKey
      redisMock.get.mockResolvedValueOnce(null); // cooldown expired

      const res = await service.resend("token-123");
      expect(res.success).toBe(true);
      expect(res.temp_token).toBe("token-123");
      expect(res.email_masked).toBe("ge***r@empresa.com");

      // Verify Redis updated
      expect(redisMock.set).toHaveBeenCalledTimes(2);
      const updatedPayload = JSON.parse(redisMock.set.mock.calls[0][1]);
      expect(updatedPayload.attempts).toBe(0);
      expect(updatedPayload.code).not.toBe("123456");

      // Verify new email sent
      expect(mailProviderMock.sendMail).toHaveBeenCalledTimes(1);
    });
  });
});
