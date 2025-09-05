import { SupabaseStorage } from "../../../../../infra/providers/storage/implementations/supabase/supabase.storage"
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository"
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository"
import { UploadProductImagesController } from "./upload-product-images.controller"

const supabaseStorage = new SupabaseStorage()
const productRepository = new ProductPrismaRepository()
const businessUserRepository = new CompanyUserPrismaRepository()

const uploadProducImageController = new UploadProductImagesController(
    supabaseStorage,
    productRepository,
    businessUserRepository
)

export { uploadProducImageController };