import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { FindBusinessProductsController } from "./find-business-products.controller";

const productRepository = new ProductPrismaRepository();
const companyDataRepository = new CompanyDataPrismaRepository();
const findBusinessProducts = new FindBusinessProductsController(productRepository, companyDataRepository);
export { findBusinessProducts };
