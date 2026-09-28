import { CloudflareR2Storage } from "../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage"
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository"
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository"
import { UploadProductImagesController } from "./upload-product-images.controller"

const supabaseStorage = new CloudflareR2Storage()
const productRepository = new ProductPrismaRepository()
const businessUserRepository = new CompanyUserPrismaRepository()

const uploadProducImageController = new UploadProductImagesController(
    supabaseStorage,
    productRepository,
    businessUserRepository
)

export { uploadProducImageController };