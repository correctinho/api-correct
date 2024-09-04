import { Uuid } from '../../../../../../../@shared/ValueObjects/uuid.vo';
import { FindEmployerItemDetailsUsecase } from '../find-employer-item-details.usecase'
import {randomUUID} from 'crypto'
const MockRepository = () => {
  return {
      create: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      findByItemUuidAndBusinessInfo:jest.fn(),
      findAllEmployerItems:jest.fn()
  };
};

describe("Unity Tests Find Employer item details usecase", () => {
  it("Should throw an error if id is missing", async () => {
    const input = {
      id: '',
      business_info_uuid: ''
    }

    const itemDetailsRepository = MockRepository()
    const usecase = new FindEmployerItemDetailsUsecase(itemDetailsRepository)

    try{
      await usecase.execute(input.id, input.business_info_uuid)
    }catch(err: any){
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe("Id is required")
    }
  })

  it("Should throw an error if id cannot be found", async () => {
    const input = {
      id: randomUUID(),
      business_info_uuid: ''
    }

    const foundItem = {
      uuid:new Uuid(),
      item_uuid: new Uuid(),
      cycle_start_day: 0,
      cycle_end_day: 0,
      created_at: '',
      update_at: ''
    }

    const itemDetailsRepository = MockRepository()
    const usecase = new FindEmployerItemDetailsUsecase(itemDetailsRepository)


    try{
      await usecase.execute(input.id, input.business_info_uuid)
    }catch(err: any){
      expect(err.statusCode).toBe(404)
      expect(err.message).toBe("Item details not found")
    }
  })

  it("Should return item", async () => {

    const foundItem = {
      uuid:new Uuid(randomUUID()),
      item_uuid: new Uuid(randomUUID()),
      business_info_uuid: new Uuid(randomUUID()),
      cycle_start_day: 0,
      cycle_end_day: 0,
      created_at: '',
      updated_at: ''
    }

    const itemDetailsRepository = MockRepository()
    itemDetailsRepository.find.mockResolvedValueOnce(foundItem)
    const usecase = new FindEmployerItemDetailsUsecase(itemDetailsRepository)

    const result = await usecase.execute(foundItem.uuid.uuid, foundItem.business_info_uuid.uuid)
    expect(result.uuid).toEqual(foundItem.uuid.uuid)
    expect(result.item_uuid).toEqual(foundItem.item_uuid.uuid)
    expect(result.business_info_uuid).toEqual(foundItem.business_info_uuid.uuid)
    expect(result.cycle_start_day).toEqual(foundItem.cycle_start_day)
    expect(result.cycle_end_day).toEqual(foundItem.cycle_end_day)
    expect(result.created_at).toEqual(foundItem.created_at)
    expect(result.updated_at).toEqual(foundItem.updated_at)

  })
})
