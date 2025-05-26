import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { FindProductController } from "./find-product-by-id.controller";

const productRepository = new ProductPrismaRepository();
const findProductController = new FindProductController(productRepository);
export { findProductController };
