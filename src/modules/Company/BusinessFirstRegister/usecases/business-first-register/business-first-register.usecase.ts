import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { BenefitsEntity } from "../../../../benefits/entities/benefit.entity";
import { IBenefitsRepository } from "../../../../benefits/repositories/benefit.repository";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { OutputGetBranchDTO } from "../../../../branch/usecases/get-branch-by-id/dto/get-branch.dto";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { BusinessRegisterEntity } from "../../entities/business-first-register.entity";
import { IBusinessFirstRegisterRepository } from "../../repositories/business-first-register.repository";
import { InputBusinessFirstRegisterDTO } from "./dto/business-first-register.dto";
const { awsSendMessage } = require('../../../../../infra/aws/sqs/sender.config.js')

let branches: OutputGetBranchDTO[] = []
let items: BenefitsEntity[] = []

export class CreateBusinessRegisterUsecase {
  constructor(
    private businessRegisterRepository: IBusinessFirstRegisterRepository,
    private companyDataRepository: ICompanyDataRepository,
    private branchRepository: IBranchRepository,
    private itemRepository: IBenefitsRepository

  ) { }

  async execute(data: InputBusinessFirstRegisterDTO) {
    const register = await BusinessRegisterEntity.create(data)

    const findBusiness = await this.companyDataRepository.findByDocument(register.document)
    if (findBusiness) throw new CustomError("Business already registered", 409)

    const findByEmail = await this.companyDataRepository.findByEmail(register.email)
    if (findByEmail) throw new CustomError("Business email already registered", 409)

    if(register.business_type === 'autonomo_comercio' || register.business_type === 'comercio'){
      //find branches
      await this.verifyBranches(register.branches_uuid)
      await this.businessRegisterRepository.save(register)
    }else{
      await this.verifyItems(register.items_uuid)
      await this.businessRegisterRepository.saveEmployer(register)

    }

    // Preparar dados para enviar para a fila SQS
    const messageData = {
      business_email: register.email,
      document: register.document,
      fantasy_name: register.fantasy_name,
      corporate_reason: register.corporate_reason
    };

    // Enviar mensagem para SQS
    //awsSendMessage(messageData);

    return {
      address_uuid: register.address_pk_uuid,
      line1: register.line1,
      line2: register.line2,
      line3: register.line3,
      neighborhood: register.neighborhood,
      postal_code: register.postal_code,
      city: register.city,
      state: register.state,
      country: register.country,
      business_info_uuid: register.business_info_uuid,
      address_fk_uuid: register.address_fk_uuid,
      fantasy_name: register.fantasy_name,
      document: register.document,
      corporate_reason: register.corporate_reason,
      branches_uuid: register.branches_uuid,
      classification: register.classification,
      colaborators_number: register.colaborators_number,
      status: register.status,
      phone_1: register.phone_1,
      phone_2: register.phone_2,
      business_type: register.business_type,
      email: register.email
    }
  }

  private async verifyBranches(branches_uuid: string[]) {

    branches_uuid.map(async (branch) => {
      const findBranch = await this.branchRepository.getByID(branch)
      if (!findBranch) throw new CustomError("Branch not found", 404);
      branches.push(findBranch)
    })
  }
  private async verifyItems(items_uuid: string[]) {

    items_uuid.map(async (item) => {
      const findItem = await this.itemRepository.find(new Uuid(item))
      if (!findItem) throw new CustomError("Item not found", 404);
      items.push(findItem)

    })
  }
}
