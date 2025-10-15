import { Request, Response } from "express";
import { IAppUserItemRepository } from "../../../../AppUser/AppUserManagement/repositories/app-user-item-repository";
import { IOfflineTokenHistoryRepository } from "../../repositories/offline-tokens-history.repository";
import { IOfflineTokenRepository } from "../../repositories/offline-tokens.repository";
import { InputActivateTokensOffline } from "./dto/activate-tokens-offline.dto";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo"; // Ajuste o caminho se necessário
import { ActivateTokensOfflineUsecase } from "./activate-tokens-offline.usecase";
import { CustomError } from "../../../../../errors/custom.error"; // Importe sua CustomError se necessário



export class ActivateTokensOfflineController {
  constructor(
    private appUserItemRepository: IAppUserItemRepository,
    private offlineTokenRepository: IOfflineTokenRepository,
    private offlineTokenHistoryRepository: IOfflineTokenHistoryRepository,
  ) {}

  async handle(req: Request, res: Response): Promise<Response> { // Retorno Promise<Response>
    try {
      // 1. Validar e construir o Input DTO
      const { userItemUuid: userItemUuidString } = req.body; // Assumindo userItemUuid vem do body

      if (!userItemUuidString) {
        throw new CustomError("userItemUuid is required in request body.", 400);
      }

      const input: InputActivateTokensOffline = {
        userInfoUuid: new Uuid(req.appUser.user_info_uuid),
        userItemUuid: new Uuid(userItemUuidString),
      };

      // 2. Instanciar e executar o Usecase
      // A injeção de dependência pode ser feita aqui ou por um container DI (ex: `index.ts`)
      const usecase = new ActivateTokensOfflineUsecase(
        this.appUserItemRepository,
        this.offlineTokenRepository,
        this.offlineTokenHistoryRepository
      );

      const result = await usecase.execute(input); // Passa o DTO construído

      // 3. Retornar sucesso
      return res.status(201).json(result);
    } catch (err: any) { // Captura CustomError ou erro genérico
      const statusCode = err instanceof CustomError ? err.statusCode : 500;
      return res.status(statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}