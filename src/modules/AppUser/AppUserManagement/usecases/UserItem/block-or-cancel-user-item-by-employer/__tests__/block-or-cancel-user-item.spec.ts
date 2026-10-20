import { randomUUID } from "crypto";
import { BlockOrCanceluserItemByEmployerUsecase } from "../block-or-cancel-user-item-by-employer.usecase";

const AppUserItemMockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByItemUuidAndUserInfo: jest.fn(),
    findAllUserItems: jest.fn(),
  };
};

const BenefitMockRepository = () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findByName: jest.fn(),
    findWithBranches: jest.fn(),
    createCustomBenefit: jest.fn(),
    findByBusiness: jest.fn(),
  };
};

describe("Unit tests Block or Cancel user item by employer", () => {
  const businessInfoUuid = randomUUID();

  it("Should throw an error if user info id is missing", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: "",
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
    };

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    await expect(usecase.execute(input)).rejects.toThrow(
      "User item uuid is required"
    );
  });

  it("Should throw an error if status input is active", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "active",
    };

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    await expect(usecase.execute(input)).rejects.toThrow("Invalid status");
  });

  it("Should throw an error if user is not found", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
    };

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    await expect(usecase.execute(input)).rejects.toThrow("User Item not found");
  });

  it("Should throw an error if user item is already cancelled", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
    };

    appUserItemRepository.find.mockResolvedValueOnce({
      business_info_uuid: { uuid: businessInfoUuid },
      status: "cancelled",
    });

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    await expect(usecase.execute(input)).rejects.toThrow(
      "User item already cancelled"
    );
  });

  it("Should throw an error if user item is already to be cancelled", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
    };

    appUserItemRepository.find.mockResolvedValueOnce({
      business_info_uuid: { uuid: businessInfoUuid },
      status: "to_be_cancelled",
    });

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    await expect(usecase.execute(input)).rejects.toThrow(
      "User item already cancelled"
    );
  });

  it("Should return blocked user item", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "blocked",
      block_reason: "Bloqueio temporário",
    };

    const mockItem: any = {
      uuid: { uuid: input.user_item_uuid },
      user_info_uuid: { uuid: randomUUID() },
      business_info_uuid: { uuid: businessInfoUuid },
      item_uuid: { uuid: randomUUID() },
      item_name: "Vale Refeição",
      balance: 10000,
      status: "active",
      blocked_at: null,
      block_reason: null,
      created_at: "2026-10-20T10:00:00",
      updated_at: "2026-10-20T10:00:00",
      blockUserItem: jest.fn(function () {
        this.status = "blocked";
      }),
      changeBlockedAt: jest.fn(function (date) {
        this.blocked_at = date;
      }),
      changeBlockReason: jest.fn(function (reason) {
        this.block_reason = reason;
      }),
    };

    appUserItemRepository.find.mockResolvedValueOnce(mockItem);

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    const result = await usecase.execute(input);
    expect(result.uuid).toBe(input.user_item_uuid);
    expect(result.status).toBe("blocked");
    expect(mockItem.blockUserItem).toHaveBeenCalled();
    expect(result.system_message).toContain("Benefício bloqueado");
  });

  it("Should return cancelled user item for pos_pago", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
      cancel_reason: "Desligamento",
    };

    const mockItem: any = {
      uuid: { uuid: input.user_item_uuid },
      user_info_uuid: { uuid: randomUUID() },
      business_info_uuid: { uuid: businessInfoUuid },
      item_uuid: { uuid: randomUUID() },
      item_name: "Cartão Pós-Pago",
      item_category: "pos_pago",
      balance: 0,
      status: "active",
      cancelled_at: null,
      cancel_reason: null,
      created_at: "2026-10-20T10:00:00",
      updated_at: "2026-10-20T10:00:00",
      cancelPostPaidUserItem: jest.fn(function () {
        this.status = "cancelled";
        this.cancelled_at = "2026-10-20T10:00:00";
      }),
      changeCancelReason: jest.fn(function (reason) {
        this.cancel_reason = reason;
      }),
    };

    appUserItemRepository.find.mockResolvedValueOnce(mockItem);

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    const result = await usecase.execute(input);
    expect(result.uuid).toBe(input.user_item_uuid);
    expect(result.status).toBe("cancelled");
    expect(mockItem.cancelPostPaidUserItem).toHaveBeenCalled();
    expect(result.system_message).toContain("revogado imediatamente");
  });

  it("Should schedule to_be_cancelled for pre_pago with balance > 0", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
      cancel_reason: "Encerramento do contrato",
    };

    const mockItem: any = {
      uuid: { uuid: input.user_item_uuid },
      user_info_uuid: { uuid: randomUUID() },
      business_info_uuid: { uuid: businessInfoUuid },
      item_uuid: { uuid: randomUUID() },
      item_name: "Vale Alimentação",
      item_category: "pre_pago",
      balance: 15000, // R$ 150,00 de saldo
      status: "active",
      cancelling_request_at: null,
      grace_period_end_date: null,
      cancel_reason: null,
      created_at: "2026-10-20T10:00:00",
      updated_at: "2026-10-20T10:00:00",
      scheduleCancelling: jest.fn(function () {
        this.status = "to_be_cancelled";
        this.cancelling_request_at = "2026-10-20T10:00:00";
      }),
      changeCancelReason: jest.fn(function (reason) {
        this.cancel_reason = reason;
      }),
    };

    appUserItemRepository.find.mockResolvedValueOnce(mockItem);

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    const result = await usecase.execute(input);
    expect(result.uuid).toBe(input.user_item_uuid);
    expect(result.status).toBe("to_be_cancelled");
    expect(mockItem.scheduleCancelling).toHaveBeenCalled();
    expect(result.system_message).toContain("saldo remanescente");
  });

  it("Should cancel immediately for pre_pago if balance is already 0", async () => {
    const appUserItemRepository = AppUserItemMockRepository();
    const benefitMockRepository = BenefitMockRepository();

    const input: any = {
      user_item_uuid: randomUUID(),
      business_info_uuid: businessInfoUuid,
      status: "cancelled",
    };

    const mockItem: any = {
      uuid: { uuid: input.user_item_uuid },
      user_info_uuid: { uuid: randomUUID() },
      business_info_uuid: { uuid: businessInfoUuid },
      item_uuid: { uuid: randomUUID() },
      item_name: "Vale Alimentação",
      item_category: "pre_pago",
      balance: 0, // Saldo zerado
      status: "active",
      cancelled_at: null,
      cancel_reason: null,
      created_at: "2026-10-20T10:00:00",
      updated_at: "2026-10-20T10:00:00",
      cancelPostPaidUserItem: jest.fn(function () {
        this.status = "cancelled";
        this.cancelled_at = "2026-10-20T10:00:00";
      }),
      changeCancelReason: jest.fn(),
    };

    appUserItemRepository.find.mockResolvedValueOnce(mockItem);

    const usecase = new BlockOrCanceluserItemByEmployerUsecase(
      appUserItemRepository as any,
      benefitMockRepository as any
    );

    const result = await usecase.execute(input);
    expect(result.uuid).toBe(input.user_item_uuid);
    expect(result.status).toBe("cancelled");
    expect(mockItem.cancelPostPaidUserItem).toHaveBeenCalled();
    expect(result.system_message).toContain("Como o saldo já estava zerado");
  });
});
