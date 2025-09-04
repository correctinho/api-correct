import { Request, Response } from "express";
import { ICartRepository } from "../../repositories/cart.repository";
import { UpdateCartItemQuantityUsecase } from "./update-cart-item-quantity.usecase";

export class UpdateCartItemQuantityController {
    constructor(
        private readonly cartRepository: ICartRepository
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const data = req.body
            data.userId = req.appUser.user_info_uuid
            
            const usecase = new UpdateCartItemQuantityUsecase(this.cartRepository);
            const result = await usecase.execute({
                userId: data.userId,
                cartItemId: req.params.itemId,
                newQuantity: data.newQuantity
            });
            return res.status(200).json(result);
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                error: err.message || "Erro interno do servidor"
            });
        }
    }
}