import { Request, Response } from "express";
import { ListUserCartsUsecase } from "./list-user-carts.usecase";
import { ICartRepository } from "../../repositories/cart.repository";

export class ListUserCartsController {
    constructor(
        private readonly cartRepository: ICartRepository
    ) { }

    async handle(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.appUser.user_info_uuid;
            const usecase = new ListUserCartsUsecase(this.cartRepository);
            // 2. Executamos o caso de uso, passando os dados necessários.
            const output = await usecase.execute({
                userId: userId
            });

            // 3. Retornamos a lista de carrinhos com o status 200 OK.
            return res.status(200).json(output);

        } catch (error: any) {
            // Em caso de erro, retornamos o status e a mensagem apropriada.
            return res.status(error.statusCode || 500).json({ error: error.message });
        }
    }
}