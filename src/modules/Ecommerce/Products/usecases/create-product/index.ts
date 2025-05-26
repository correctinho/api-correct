import { SupabaseStorage } from "../../../../../infra/providers/storage/implementations/supabase/supabase.storage";
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { CategoriesPrismaRepository } from "../../../Categories/repositories/implementations/category.prisma.repository";
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { CreateProductController } from "./create-product.controller";

const storage = new SupabaseStorage()
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
