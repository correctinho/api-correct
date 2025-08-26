import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { DeleteProductController } from "./delete-product.controller";

const productRepository = new ProductPrismaRepository()

const deleteProductController = new DeleteProductController(
    productRepository
)

export { deleteProductController }