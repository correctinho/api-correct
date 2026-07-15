import { PartnerConfigEntity } from "../../PartnerConfig/entities/partner-config.entity";
import { BusinessRegisterEntity } from "../entities/business-first-register.entity";

// Nova Tipagem Estrita
export interface CheckBusinessStatusResult {
    uuid: string;
    status: string;
    fantasy_name: string;
}

export interface IBusinessFirstRegisterRepository {
    savePartner(data: BusinessRegisterEntity, partnerConfig: PartnerConfigEntity, correctUserUuid?: string): Promise<any>;
    saveSelfServicePartner(data: BusinessRegisterEntity, partnerConfig: PartnerConfigEntity): Promise<any>;
    saveEmployer(data: BusinessRegisterEntity, correctUserUuid?: string): Promise<any>;
    save(data: any, data1: any): Promise<any>;
    checkBusinessStatus(document: string): Promise<CheckBusinessStatusResult | null>;
}