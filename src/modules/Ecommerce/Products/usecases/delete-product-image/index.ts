import { SupabaseStorage } from "../../../../../infra/providers/storage/implementations/supabase/supabase.storage";
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { DeleteProductImageController } from "./delete-product-image.controller";

const productRepository = new ProductPrismaRepository();
const businessUserRepository = new CompanyUserPrismaRepository();
const supabaseStorage = new SupabaseStorage()
const deleteProductImagesController = new DeleteProductImageController(
    productRepository,
    businessUserRepository,
    supabaseStorage
);

export { deleteProductImagesController };