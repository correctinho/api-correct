import { Request, Response } from "express";
import { IBenefitGroupsRepository } from "../../repositories/benefit-groups.repository";
import { IBusinessItemDetailsRepository } from "../../../BusinessItemsDetails/repositories/business-item-details.repository";
import { SyncGroupMembersUsecase } from "./sync-group-members.usecase";

export class SyncGroupMembersController {
    constructor(
        private benefitGroupsRepository: IBenefitGroupsRepository,
        private businessItemDetailsRepository: IBusinessItemDetailsRepository
    ) {}
  
    async handle(request: Request, response: Response) {
        try {
            const business_info_uuid = request.companyUser.businessInfoUuid;
            const data = request.body; // Pega o payload

            // Instancia o UseCase passando as dependências injetadas
            const syncGroupMembersUsecase = new SyncGroupMembersUsecase(
                this.benefitGroupsRepository,
                this.businessItemDetailsRepository
            );

            await syncGroupMembersUsecase.execute(business_info_uuid, data);

            return response.status(200).json({ message: "Membros atualizados com sucesso." });

        } catch (err: any) {
            return response.status(err.statusCode || 500).json({
                error: err.message || "Erro inesperado ao sincronizar membros."
            });
        }
    }
}