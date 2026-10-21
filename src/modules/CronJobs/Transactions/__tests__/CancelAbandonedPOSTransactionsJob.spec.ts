import { CancelAbandonedPOSTransactionsJob } from "../CancelAbandonedPOSTransactionsJob";
import { ITransactionOrderRepository } from "../../../Payments/Transactions/repositories/transaction-order.repository";

describe("CancelAbandonedPOSTransactionsJob Unit Tests", () => {
  let mockTransactionRepository: jest.Mocked<Partial<ITransactionOrderRepository>>;
  let job: CancelAbandonedPOSTransactionsJob;

  beforeEach(() => {
    mockTransactionRepository = {
      cancelAbandonedPOSTransactions: jest.fn().mockResolvedValue(5),
    };

    job = new CancelAbandonedPOSTransactionsJob(
      mockTransactionRepository as ITransactionOrderRepository
    );
  });

  it("should have correct name and default schedule", () => {
    expect(job.name).toBe("CancelAbandonedPOSTransactionsJob");
    expect(job.schedule).toBe("*/30 * * * *");
  });

  it("should call cancelAbandonedPOSTransactions with default 30 minutes cutoff and return result", async () => {
    const result = await job.execute();

    expect(mockTransactionRepository.cancelAbandonedPOSTransactions).toHaveBeenCalledTimes(1);
    const calledCutoff = (mockTransactionRepository.cancelAbandonedPOSTransactions as jest.Mock).mock.calls[0][0];

    expect(calledCutoff).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    expect(result.cancelledCount).toBe(5);
    expect(result.cutoffDate).toBe(calledCutoff);
  });

  it("should support a custom minutesThreshold parameter", async () => {
    await job.execute(60);

    expect(mockTransactionRepository.cancelAbandonedPOSTransactions).toHaveBeenCalledTimes(1);
    const calledCutoff = (mockTransactionRepository.cancelAbandonedPOSTransactions as jest.Mock).mock.calls[0][0];
    expect(calledCutoff).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });
});
