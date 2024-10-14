import { CustomError } from "../../../../../errors/custom.error";
import { ICompanyUserRepository } from "../../repositories/company-user.repository";

export class CompanyUserDetailsUsecase{
    constructor(
        private companyUserRepository: ICompanyUserRepository
    ){}

    async execute(id: string){

        const getUserDetails = await this.companyUserRepository.findById(id)
        if(!getUserDetails) throw new CustomError("User not found", 401)

        return getUserDetails
    }
}
