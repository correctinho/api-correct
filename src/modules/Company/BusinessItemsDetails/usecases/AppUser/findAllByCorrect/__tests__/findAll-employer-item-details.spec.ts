import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';
import { FindAllEmployerItemDetailsUsecase } from '../findAll-employer-item-details.usecase'

import { randomUUID } from 'crypto'
const MockRepository = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findByItemUuidAndBusinessInfo: jest.fn(),
    findAllEmployerItems: jest.fn()
  };
};

describe("Unity Tests Find Employer item details usecase", () => {
  it("Should throw an error if id is missing", async () => {
    const input = {
      id: ''
    }

    const itemDetailsRepository = MockRepository()
    const usecase = new FindAllEmployerItemDetailsUsecase(itemDetailsRepository)

    try {
      await usecase.execute(input.id)
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Id is required")
    }
  })

  it("Should return an empty array", async () => {
    const input = {
      id: new Uuid()
    }

    const itemDetailsRepository = MockRepository()
    itemDetailsRepository.findAllEmployerItems.mockResolvedValueOnce([])
    const usecase = new FindAllEmployerItemDetailsUsecase(itemDetailsRepository)


    const result = await usecase.execute(input.id.uuid)
    expect(result.length).toBe(0)
  })

  it("Should return an list of arrays", async () => {
    const input = {
      id: new Uuid()
    }

    const foundItems = [
      {
        uuid: new Uuid(randomUUID()),
        item_uuid: new Uuid(randomUUID()),
        business_info_uuid: new Uuid(randomUUID()),
        cycle_start_day: 0,
        cycle_end_day: 0,
        created_at: '',
        updated_at: ''
      },
      {
        uuid: new Uuid(randomUUID()),
        item_uuid: new Uuid(randomUUID()),
        business_info_uuid: new Uuid(randomUUID()),
        cycle_start_day: 0,
        cycle_end_day: 0,
        created_at: '',
        updated_at: ''
      },
      {
        uuid: new Uuid(randomUUID()),
        item_uuid: new Uuid(randomUUID()),
        business_info_uuid: new Uuid(randomUUID()),
        cycle_start_day: 0,
        cycle_end_day: 0,
        created_at: '',
        updated_at: ''
      }
    ]

    const itemDetailsRepository = MockRepository()
    itemDetailsRepository.findAllEmployerItems.mockResolvedValueOnce(foundItems)
    const usecase = new FindAllEmployerItemDetailsUsecase(itemDetailsRepository)


    const result = await usecase.execute(input.id.uuid)
    expect(result.length).toBe(3)
  })


})
