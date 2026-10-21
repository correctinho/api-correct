import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { CloudflareR2Storage } from "../../../../../../infra/providers/storage/implementations/cloudflare-r2/cloudflare-r2.storage";
import { AxiosSlackProvider } from "../../../../../../infra/providers/SlackProvider";
import { UploadRechargeReceiptController } from "./upload-recharge-receipt.controller";

const businessOrderRepository = new BusinessOrderPrismaRepository();
const storageProvider = new CloudflareR2Storage();
const slackProvider = new AxiosSlackProvider();

const uploadRechargeReceiptController = new UploadRechargeReceiptController(
    businessOrderRepository,
    storageProvider,
    slackProvider
);

export { uploadRechargeReceiptController };
