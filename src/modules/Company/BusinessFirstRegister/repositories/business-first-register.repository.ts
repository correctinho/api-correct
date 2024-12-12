import { PartnerConfigEntity } from "../../PartnerConfig/entities/partner-config.entity";
import { BusinessRegisterEntity } from "../entities/business-first-register.entity";

export interface IBusinessFirstRegisterRepository{
    savePartner(data: BusinessRegisterEntity, partnerConfig: PartnerConfigEntity, correctUserUuid?: string): Promise<any>
    saveEmployer(data: BusinessRegisterEntity, correctUserUuid?: string): Promise<void>
}
