import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { InputCreateBenefitDto } from "./create-benefit.dto";
import { CreateBenefitUsecase } from "./create-benefit.usecase";

const input: InputCreateBenefitDto = {
    name:"Vale Alimentação",
    description: "Descrição do vale",
    parent_uuid: null,
    item_type: 'gratuito',
    item_category: 'pre_pago',
}

const MockRepository = () => {
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

describe("Unit test create benefit usecase", () => {
    it("Should create a benefit", async () => {
        const benefitMockRepository = MockRepository()
        const createBenefitUsecase = new CreateBenefitUsecase(benefitMockRepository)

        const output = await createBenefitUsecase.execute(input)
        expect(output).toHaveProperty('uuid')
        expect(output.name).toBe(input.name)
        expect(output.description).toBe(input.description)
        expect(output.item_type).toBe(input.item_type)
        expect(output.item_category).toBe(input.item_category)
        expect(output.parent_uuid).toBe(input.parent_uuid)
        expect(output.business_info_uuid).toBeFalsy()


    })

    it("Should thrown an error if name is missing", async () => {
        const benefitMockRepository = MockRepository()
        const createBenefitUsecase = new CreateBenefitUsecase(benefitMockRepository)

        input.name = ""

        await expect(createBenefitUsecase.execute(input)).rejects.toThrow("Name is required")
    })

})
