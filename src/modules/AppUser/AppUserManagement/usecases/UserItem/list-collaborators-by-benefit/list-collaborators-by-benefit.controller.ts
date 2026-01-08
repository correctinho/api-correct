import { IAppUserItemRepository } from "../../../repositories/app-user-item-repository";
import { Request, Response } from "express";
import { ListCollaboratorsByBenefitUsecase } from "./list-collaborators-by-benefit.usecase";

export class ListCollaboratorsByBenefitController {
    constructor(
        private appUserItemRepository: IAppUserItemRepository
    ) { }

    async handle(req: Request, res: Response) {
        try {
            // 1. SEGURANÇA: O ID da empresa vem do token de autenticação
            const business_info_uuid = req.companyUser.businessInfoUuid;

            // 2. ROTA: O ID do benefício (Item) vem da URL (ex: /business/item/details/:id/collaborators)
            const item_uuid = req.params.id; 

            // 3. FILTROS: Paginação e Status vêm da Query String (ex: ?page=1&status=inactive)
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query.status ? String(req.query.status) : undefined;
            // Se quiser adicionar busca por nome depois:
            // const search = req.query.search ? String(req.query.search) : undefined;

            const usecase = new ListCollaboratorsByBenefitUsecase(this.appUserItemRepository);

            const result = await usecase.execute({
                business_info_uuid,
                item_uuid,
                page,
                limit,
                status
            });
            return res.status(200).json(result);

        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message
            });
        }
    }
}