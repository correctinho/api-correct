import { CloudflareR2Storage } from "../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { CategoriesPrismaRepository } from "../../../Categories/repositories/implementations/category.prisma.repository";
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { CreateProductController } from "./create-product.controller";

const storage = new CloudflareR2Storage()
const productRepository = new ProductPrismaRepository()
const categoryRepository = new CategoriesPrismaRepository()
const businessUserRepository = new CompanyUserPrismaRepository()

const createProductController = new CreateProductController(
  storage,
  productRepository,
  categoryRepository,
  businessUserRepository
)

export { createProductController };
