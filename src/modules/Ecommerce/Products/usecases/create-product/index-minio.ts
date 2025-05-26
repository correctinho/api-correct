import { MinioStorage } from "../../../../../infra/providers/storage/implementations/minio/minio.storage";
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { CategoriesPrismaRepository } from "../../../Categories/repositories/implementations/category.prisma.repository";
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { CreateProductController } from "./create-product.controller";

const storage = new MinioStorage()
const productRepository = new ProductPrismaRepository()
const categoryRepository = new CategoriesPrismaRepository()
const businessUserRepository = new CompanyUserPrismaRepository()

const createProductControllerOnMinio = new CreateProductController(
  storage,
  productRepository,
  categoryRepository,
  businessUserRepository
)

export { createProductControllerOnMinio };
