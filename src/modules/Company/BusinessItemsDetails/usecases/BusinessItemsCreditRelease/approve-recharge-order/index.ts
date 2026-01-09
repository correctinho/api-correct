import { TitanMailProvider } from "../../../../../../infra/providers/MailProvider/implementations/TitanMailProvider";
import { BusinessOrderPrismaRepository } from "../../../repositories/implementations/business-order-prisma.repository";
import { ApproveRechargeOrderController } from "./approve-recharge-order.controller";

const titanEmailProvider = new TitanMailProvider();
const businessOrderRepository = new BusinessOrderPrismaRepository()

const approveRechargeOrder = new ApproveRechargeOrderController(
    businessOrderRepository,
    titanEmailProvider
)

export { approveRechargeOrder };