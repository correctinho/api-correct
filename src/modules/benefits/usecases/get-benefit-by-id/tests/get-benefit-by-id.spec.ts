import { BenefitsEntity } from "../../../entities/benefit.entity";
import { InputCreateBenefitDto } from "../../create-benefit/create-benefit.dto";
import { GetBenefitByIDUsecase } from "../get-benefit-by-id.usecase";


const benefitInput: InputCreateBenefitDto = {
  name: "Vale Alimentação",
  description: "Descrição Vale Alimentação",
  item_type: 'gratuito',
  item_category: 'pre_pago',
  parent_uuid: null,
  created_at: '',
  updated_at: ''
}

const benefit = new BenefitsEntity(benefitInput)

const MockRepository = () => {
  return {
    create: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve([benefit])),
    update: jest.fn(),
    findAll: jest.fn(),
    findByName: jest.fn(),
    findWithBranches: jest.fn().mockReturnValue(Promise.resolve([benefit]))
  };
};

const BranchMockRepository = () => {
  return {
    create: jest.fn(),
    getByID: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
    findByName: jest.fn(),
    createMany: jest.fn()
  };
};
describe("Unit test get benefit by id", () => {
    it("Should find benefit", async () => {

      const benefitMockRepository = MockRepository()
      const getBenefitUsecase = new GetBenefitByIDUsecase(benefitMockRepository)

      const input = {
        uuid: benefit.uuid
      }

      const output = {
        uuid: input.uuid,
        name: benefit.name,
        description: benefit.description,
        item_type: benefit.item_type,
        item_category: benefit.item_category,
        created_at: benefit.created_at,
        updated_at: benefit.updated_at
      }

      // const result = await getBenefitUsecase.execute(input.uuid.uuid)

      // expect(result).toEqual(output)

    })
})
