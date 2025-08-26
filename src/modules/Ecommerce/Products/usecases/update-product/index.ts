import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { UpdateProductController } from "./update-product.controller";

const productRepository = new ProductPrismaRepository();
const updateProduct = new UpdateProductController(productRepository);

export { updateProduct}