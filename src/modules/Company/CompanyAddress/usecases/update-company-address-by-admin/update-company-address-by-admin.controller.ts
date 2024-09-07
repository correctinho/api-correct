import { Request, Response } from "express";
import { CompanyAddressEntity } from "../../entities/company-address.entity";
import { UpdateCompanyDataAndAddressByAdminUsecase } from "./update-company-address-by-admin.usecase";
import { ICompanyAddressRepository } from "../../repositories/company-address.repository";
import { UpdateBusinessInfoUsecase } from "../../../CompanyData/usecases/update-business-info/update-business-info.usecase";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { CompanyDataEntity } from "../../../CompanyData/entities/company-data.entity";

export class UpdateCompanyDataAndAddressByAdminController {
    constructor(
        private companyAddressRepository: ICompanyAddressRepository,
        private companyDataRepository: ICompanyDataRepository


    ) { }

    async handle(req: Request, res: Response) {

        try {
            const address: CompanyAddressEntity = {...req.body}

            address.uuid = req.query.address_uuid as string

            const companyAddressUsecase = new UpdateCompanyDataAndAddressByAdminUsecase(this.companyAddressRepository)

            await companyAddressUsecase.execute(address)

            return res.json({message: "Address updated successfully"})

        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message
            })

        }
    }
}
