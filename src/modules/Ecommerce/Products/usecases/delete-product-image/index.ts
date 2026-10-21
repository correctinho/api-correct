import { CloudflareR2Storage } from "../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";
import { CompanyUserPrismaRepository } from "../../../../Company/CompanyUser/repositories/implementations/company-user.prisma.repository";
import { ProductPrismaRepository } from "../../repositories/implementations/product-prisma.repository";
import { DeleteProductImageController } from "./delete-product-image.controller";

const productRepository = new ProductPrismaRepository();
const businessUserRepository = new CompanyUserPrismaRepository();
const supabaseStorage = new CloudflareR2Storage()
const deleteProductImagesController = new DeleteProductImageController(
    productRepository,
    businessUserRepository,
    supabaseStorage
);

export { deleteProductImagesController };