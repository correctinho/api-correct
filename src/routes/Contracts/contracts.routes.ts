import { Router } from "express";
// import { companyIsAuth } from "../../infra/shared/middlewares/CompanyAdmin/company-admin-auth.middlware";
// import { createCompanyContractController } from "../../modules/Contracts/Company/usecases/create-company-contract";
// import { findCompanyContractsController } from "../../modules/Contracts/Company/usecases/find-company-contracts";
// import { findSingleCompanyContractsController } from "../../modules/Contracts/Company/usecases/find-single-company-contracts";

export const contractsRouter = Router()


// //create company contract
// contractsRouter.post("/company-contract", companyIsAuth, async (request, response) => {
//     await createCompanyContractController.handle(request, response)
// })

// //find company contracts by business info id - Authenticated company admin
// contractsRouter.get('/company-contracts', companyIsAuth, async (request, response) => {
//     await findCompanyContractsController.handle(request, response)
// })

// //find single company contract by contract id - auth company admin
// contractsRouter.get("/company-contract", companyIsAuth, async (request, response) => {
//     await findSingleCompanyContractsController.handle(request, response)
// })
