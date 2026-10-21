import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { IAppUserItemRepository } from "../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { ProcessGracePeriodJob } from "../ProcessGracePeriodJob";

describe("ProcessGracePeriodJob Unit Tests", () => {
  let mockUserItemRepository: jest.Mocked<Partial<IAppUserItemRepository>>;
  let job: ProcessGracePeriodJob;

  beforeEach(() => {
    mockUserItemRepository = {
      findItemsWithExpiredGracePeriod: jest.fn(),
      updateStatusBulk: jest.fn().mockResolvedValue(undefined),
    };

    job = new ProcessGracePeriodJob(
      mockUserItemRepository as IAppUserItemRepository
    );
  });

  it("should have correct name and schedule (04:00 AM)", () => {
    expect(job.name).toBe("ProcessGracePeriodJob");
    expect(job.schedule).toBe("0 4 * * *");
  });

  it("should do nothing when no items have reached zero balance", async () => {
    (mockUserItemRepository.findItemsWithExpiredGracePeriod as jest.Mock).mockResolvedValueOnce([]);

    await job.execute();

    expect(mockUserItemRepository.findItemsWithExpiredGracePeriod).toHaveBeenCalledTimes(1);
    expect(mockUserItemRepository.updateStatusBulk).not.toHaveBeenCalled();
  });

  it("should cancel eligible items with zero balance in bulk", async () => {
    const fakeUuid1 = new Uuid();
    const fakeUuid2 = new Uuid();

    const fakeEntities = [
      { uuid: fakeUuid1, balance: 0, status: "to_be_cancelled" },
      { uuid: fakeUuid2, balance: 0, status: "to_be_cancelled" },
    ];

    (mockUserItemRepository.findItemsWithExpiredGracePeriod as jest.Mock).mockResolvedValueOnce(fakeEntities);

    await job.execute();

    expect(mockUserItemRepository.findItemsWithExpiredGracePeriod).toHaveBeenCalledTimes(1);
    expect(mockUserItemRepository.updateStatusBulk).toHaveBeenCalledTimes(1);
    expect(mockUserItemRepository.updateStatusBulk).toHaveBeenCalledWith(
      [fakeUuid1, fakeUuid2],
      "cancelled"
    );
  });
});
