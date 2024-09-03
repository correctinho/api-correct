import { Uuid } from '../../../../../../@shared/ValueObjects/uuid.vo';
import { CreateEmployerItemByCorrectUsecase } from '../create-employer-item-by-correct.usecase'
import { randomUUID} from 'crypto'
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

const BenefitsMockRepository = () => {
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

const BusinessInfoMockRepository = () => {
  return {
    update: jest.fn(),
    findByDocument: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    deleteById: jest.fn()
  }
}

describe("Unity Tests Create Employer Item Details", () => {
  it("Should throw an error if cycle end day is missing or equal to zero", async () => {
    const itemsDetailsRepository = ItemDetailsMockRepository()
    const benefitsRepository = BenefitsMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      item_uuid: randomUUID(),
      business_info_uuid: randomUUID(),
      cycle_end_day: 0
    }

    const usecase = new CreateEmployerItemByCorrectUsecase(
      itemsDetailsRepository,
      benefitsRepository,
      businessInfoRepository
    )

    try{
      await usecase.execute(input)
    }catch(err: any){
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe('Cycle end day is required')
    }

  })
  it("Should throw an error if item uuid is not found", async () => {
    const itemsDetailsRepository = ItemDetailsMockRepository()
    const benefitsRepository = BenefitsMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      item_uuid: randomUUID(),
      business_info_uuid: randomUUID(),
      cycle_end_day: 2
    }

    const usecase = new CreateEmployerItemByCorrectUsecase(
      itemsDetailsRepository,
      benefitsRepository,
      businessInfoRepository
    )

    try{
      await usecase.execute(input)
    }catch(err: any){
      expect(err.statusCode).toBe(404)
      expect(err.message).toBe("Item not found")
    }

  })
  it("Should throw an error if item uuid is not found", async () => {
    const itemsDetailsRepository = ItemDetailsMockRepository()
    const benefitsRepository = BenefitsMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      item_uuid: randomUUID(),
      business_info_uuid: randomUUID(),
      cycle_end_day: 2
    }
    benefitsRepository.find.mockResolvedValueOnce({
      uuid: input.item_uuid,
      name: "Test name",
      description: "Description",
      item_type:"item type",
      item_category:"item category",
      parent_uuid: null,
      business_info_uuid: null,

    })


    const usecase = new CreateEmployerItemByCorrectUsecase(
      itemsDetailsRepository,
      benefitsRepository,
      businessInfoRepository
    )

    try{
      await usecase.execute(input)
    }catch(err: any){
      expect(err.statusCode).toBe(404)
      expect(err.message).toBe("Business not found")
    }

  })

  it("Should throw an error if item detail is already registered", async () => {
    const itemsDetailsRepository = ItemDetailsMockRepository()
    const benefitsRepository = BenefitsMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      item_uuid: randomUUID(),
      business_info_uuid: randomUUID(),
      cycle_end_day: 2
    }

    benefitsRepository.find.mockResolvedValueOnce({
      uuid: input.item_uuid,
      name: "Test name",
      description: "Description",
      item_type:"gratuito",
      item_category:"pre pago",
      parent_uuid: null,
      business_info_uuid: null,

    })
    businessInfoRepository.findById.mockResolvedValueOnce({})
    itemsDetailsRepository.findByItemUuidAndBusinessInfo.mockResolvedValueOnce({

    })


    const usecase = new CreateEmployerItemByCorrectUsecase(
      itemsDetailsRepository,
      benefitsRepository,
      businessInfoRepository
    )

    try{
      await usecase.execute(input)

    }catch(err: any){
      expect(err.statusCode).toBe(409)
      expect(err.message).toBe("Business Already has this item")

    }

  })

  it("Should create a new item details", async () => {
    const itemsDetailsRepository = ItemDetailsMockRepository()
    const benefitsRepository = BenefitsMockRepository()
    const businessInfoRepository = BusinessInfoMockRepository()

    const input = {
      item_uuid: randomUUID(),
      business_info_uuid: randomUUID(),
      cycle_end_day: 2
    }

    benefitsRepository.find.mockResolvedValueOnce({
      uuid: input.item_uuid,
      name: "Test name",
      description: "Description",
      item_type:"gratuito",
      item_category:"pre pago",
      parent_uuid: null,
      business_info_uuid: null,

    })
    businessInfoRepository.findById.mockResolvedValueOnce({})

    const usecase = new CreateEmployerItemByCorrectUsecase(
      itemsDetailsRepository,
      benefitsRepository,
      businessInfoRepository
    )


    const result = await usecase.execute(input)
    expect(result).toHaveProperty('uuid')
    expect(result.cycle_end_day).toBe(2)
    expect(result.cycle_start_day).toBe(3)


  })
})
