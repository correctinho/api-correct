import request from "supertest";
import { app } from "../../../app";
import { cancelAbandonedPOSTransactionsJob } from "../../../modules/CronJobs/Transactions";

describe("Cron Routes E2E Tests", () => {
  const cronSecret = "test-cron-secret";

  beforeAll(() => {
    process.env.CRON_SECRET = cronSecret;
  });

  describe("POST /cron/transactions/cancel-abandoned", () => {
    it("should return 401 if x-cron-secret is missing", async () => {
      const response = await request(app)
        .post("/cron/transactions/cancel-abandoned")
        .send();

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Acesso negado");
    });

    it("should return 401 if x-cron-secret is invalid", async () => {
      const response = await request(app)
        .post("/cron/transactions/cancel-abandoned")
        .set("x-cron-secret", "wrong-secret")
        .send();

      expect(response.status).toBe(401);
    });

    it("should execute job and return 200 with result when secret is valid", async () => {
      const spy = jest
        .spyOn(cancelAbandonedPOSTransactionsJob, "execute")
        .mockResolvedValueOnce({
          cancelledCount: 3,
          cutoffDate: "2026-10-19T11:00:00",
        });

      const response = await request(app)
        .post("/cron/transactions/cancel-abandoned?minutes=45")
        .set("x-cron-secret", cronSecret)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.job).toBe("CancelAbandonedPOSTransactionsJob");
      expect(response.body.cancelled_count).toBe(3);
      expect(response.body.threshold_minutes).toBe(45);
      expect(spy).toHaveBeenCalledWith(45);

      spy.mockRestore();
    });

    it("should use default 30 minutes when minutes query param is omitted", async () => {
      const spy = jest
        .spyOn(cancelAbandonedPOSTransactionsJob, "execute")
        .mockResolvedValueOnce({
          cancelledCount: 0,
          cutoffDate: "2026-10-19T11:15:00",
        });

      const response = await request(app)
        .post("/cron/transactions/cancel-abandoned")
        .set("Authorization", `Bearer ${cronSecret}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.cancelled_count).toBe(0);
      expect(response.body.threshold_minutes).toBe(30);
      expect(spy).toHaveBeenCalledWith(30);

      spy.mockRestore();
    });
  });
});
