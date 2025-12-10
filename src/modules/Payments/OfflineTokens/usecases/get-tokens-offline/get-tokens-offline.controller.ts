import { Request, Response } from "express";
import { CustomError } from "../../../../../errors/custom.error";
import { IOfflineTokenRepository } from "../../repositories/offline-tokens.repository";
import { IOfflineTokenHistoryRepository } from "../../repositories/offline-tokens-history.repository";
import { GetTokensOfflineUsecase } from "./get-tokens-offline.usecase";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";

export class GetTokensOfflineController {
    constructor(
        private offlineTokenRepository: IOfflineTokenRepository,
        private offlineTokenHistoryRepository: IOfflineTokenHistoryRepository
  ) {}

    async handle(req: Request, res: Response): Promise<Response> {
        try{
            const data = req.body
            data.userInfoUuid = new Uuid(req.appUser.user_info_uuid);
            const usecase = new GetTokensOfflineUsecase(
                this.offlineTokenRepository,
                this.offlineTokenHistoryRepository
            )

            const result = await usecase.execute(data);
            return res.status(200).json(result);
        }catch(err: any){
            console.log({err})
            const statusCode = err instanceof CustomError ? err.statusCode : 500;
                  return res.status(statusCode).json({
                    error: err.message || "Internal Server Error",
                  });
        }
    }
}