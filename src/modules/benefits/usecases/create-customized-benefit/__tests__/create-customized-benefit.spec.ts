import { CreateCustomizedBenefitUsecase } from '../create-customized-benefit.usecase'
import { ItemType, ItemCategory } from '../../create-benefit/create-benefit.dto';
const BenefitMockRepository = () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findByName: jest.fn(),
    findWithBranches: jest.fn(),
    createCustomBenefit: jest.fn(),
    findByBusiness: jest.fn()
  };
};

const ItemDetailsMockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByItemUuidAndBusinessInfo: jest.fn(),
    findAllEmployerItems: jest.fn()
  };
};

const BusinessInfoMockRepository = () => {
  return {
    update: jest.fn(),
    findByDocument: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    deleteById: jest.fn()
  }
}

describe("Unit Tets Create customized benefit", () => {
  it("Should throw an error if business info id is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      name: "Vale Alimentação",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: '',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Business id is required")
    }
  })

  it("Should throw an error if cycle end day is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "Descrição",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'gratuito' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 0
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Cycle end day is required")
    }
  })
  it("Should throw an error if description is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'gratuito' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Description is required")
    }
  })
  it("Should throw an error if business info id is not found", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      name: "Vale Alimentação",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(404)
      expect(err.message).toBe("Business not found")
    }
  })

  it("Should throw an error if name is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "",
      description: "Descrição do vale",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Name is required")
    }
  })

  it("Should throw an error if description is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Description is required")
    }
  })

  it("Should throw an error if item type is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "Descrição",
      parent_uuid: null,
      item_type: '' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Item type is required")
    }
  })

  it("Should throw an error if item category is missing", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "Descrição",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: '' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Item category is required")
    }
  })

  it("Should throw an error if business already has this custom item", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})
    benefitsRepository.findByBusiness.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "Descrição",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    try {
      await usecase.execute(input)
    } catch (err: any) {
      expect(err.statusCode).toBe(409)
      expect(err.message).toBe("Business already has this custom item")
    }
  })

  it("Should create business custom item", async () => {
    const benefitsRepository = BenefitMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    businessInfoRepository.findById.mockResolvedValueOnce({})

    const input = {
      name: "Test name",
      description: "Descrição",
      parent_uuid: null,
      item_type: 'gratuito' as ItemType,
      item_category: 'pre_pago' as ItemCategory,
      business_info_uuid: 'any uuid',
      cycle_end_day: 2
    }

    const usecase = new CreateCustomizedBenefitUsecase(benefitsRepository, businessInfoRepository)

    const result = await usecase.execute(input)
    expect(result).toHaveProperty("uuid")
    expect(result.name).toBe(input.name)
    expect(result.description).toBe(input.description)
    expect(result.item_type).toBe(input.item_type)
    expect(result.item_category).toBe(input.item_category)
    expect(result.cycle_start_day).toBe(3)
    expect(result.cycle_end_day).toBe(2)
  })
})
