import { Request, Response } from "express";
import { AppUserAuthSignUpUsecase } from "./app-user-auth.signup.usecase";
import { IAppUserInfoRepository } from "../../../repositories/app-user-info.repository";
import { IAppUserAuthRepository } from "../../../repositories/app-use-auth-repository";
import { InputCreateAppUserDTO } from "../../../../app-user-dto/app-user.dto";

export class AppUserAuthSignUpController {
    constructor(
        private appUserSingUpRepository: IAppUserAuthRepository,
        private appUserInfoRepository: IAppUserInfoRepository
        ) { }

    async handle(req: Request, res: Response) {
        try {
            const data: InputCreateAppUserDTO = req.body;

            const appUserSignUpUsecase = new AppUserAuthSignUpUsecase(this.appUserSingUpRepository, this.appUserInfoRepository);
            const user = await appUserSignUpUsecase.execute(data);

            return res.status(201).json(user);

        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message,
            });
        }
    }
}
