import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { FindBusinessProductsController } from "./find-business-products.controller";

const productRepository = new ProductPrismaRepository();
const findBusinessProducts = new FindBusinessProductsController(productRepository);
export { findBusinessProducts };
