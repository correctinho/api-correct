import { BenefitsEntity } from "../../../entities/benefit.entity"
import { InputCreateBenefitDto } from "../../create-benefit/create-benefit.dto"
import { InputUpdateBenefitDTO } from "../update-benefit.dto";
import { UpdateBenefitUsecase } from "../update-benefit.usercase";

const benefitInputCreate: InputCreateBenefitDto = {
    name: "Vale Alimentação",
    description: "Descrição Vale Alimentação",
    item_type: 'gratuito',
    item_category: 'pre_pago',
    parent_uuid: null,
    created_at: '',
    updated_at: ''
  }

  const benefit = new BenefitsEntity(benefitInputCreate)

  const benefitInputUpdate: InputUpdateBenefitDTO = {
    uuid:benefit.uuid,
    name: "Vale Alimentação",
    description: "Descrição Vale Alimentação Atualizado",
    item_type: 'gratuito',
    item_category: 'pre_pago',
    parent_uuid: null,

  }

  const MockRepository = () => {
    return {
      create: jest.fn(),
      find: jest.fn().mockReturnValue(Promise.resolve(benefit)),
      update: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      findWithBranches: jest.fn()
    };
  };

  describe("Unit test for benefit update usecase", () => {
    it("Should update a benefit", async () => {
        const benefitMockRepository = MockRepository()
        const benefitUpdateUsecase = new UpdateBenefitUsecase(benefitMockRepository)

        const output = await benefitUpdateUsecase.execute(benefitInputUpdate)

        expect(output.uuid).toEqual(benefitInputUpdate.uuid.uuid)
        expect(output.name).toEqual(benefitInputUpdate.name)
        expect(output.description).toEqual(benefitInputUpdate.description)
        expect(output.item_type).toEqual(benefitInputUpdate.item_type)
        expect(output.item_category).toEqual(benefitInputUpdate.item_category)
        expect(output.parent_uuid).toEqual(benefitInputUpdate.parent_uuid)
    })
  })
