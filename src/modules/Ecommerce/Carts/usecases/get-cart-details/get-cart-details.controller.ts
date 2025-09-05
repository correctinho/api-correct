import { Request, Response } from "express";
import { ICartRepository } from "../../repositories/cart.repository";
import { GetCartDetailsUsecase } from "./get-cart-details.usecase";

export class GetCartDetailsController {
    constructor(private readonly cartRepository: ICartRepository) { }

    async handle(req: Request, res: Response) {
        try {
            const data = req.body
            data.cartId = req.params.cartId
            data.userId = req.appUser.user_info_uuid

            const usecase = new GetCartDetailsUsecase(this.cartRepository);
            const result = await usecase.execute({
                userId: data.userId,
                cartId: req.params.cartId
            });
            return res.status(200).json(result);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message || "Erro interno do servidor"
            });
        }
    }
}