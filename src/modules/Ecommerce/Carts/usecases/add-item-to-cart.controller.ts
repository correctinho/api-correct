import { Request, Response } from "express";
import { ICartRepository } from "../repositories/cart.repository";
import { IProductRepository } from "../../Products/repositories/product.repository";
import { AddItemToCartUsecase } from "./add-item-to-cart.usecase";
export class AddItemToCartController {
    constructor(
        private readonly cartRepository: ICartRepository,
        private readonly productRepository: IProductRepository
    ) { }

    async handle(req: Request, res: Response) {
        try {
            const data = req.body
            data.userId = req.appUser.user_info_uuid

            const usecase = new AddItemToCartUsecase(
                this.cartRepository,
                this.productRepository
            )

            const result = await usecase.execute(data)

            return res.status(200).json(result)
        } catch (err: any) {
            return res.status(err.statusCode).json({
                error: err.message || "Internal Server Error",
            });
        }
    }
}