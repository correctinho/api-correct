import { GetAdminTransactionDetailsUseCase } from "./get-admin-transaction-details.usecase";
import { GetAdminTransactionDetailsController } from "./get-admin-transaction-details.controller";

const getAdminTransactionDetailsUseCase = new GetAdminTransactionDetailsUseCase();
const getAdminTransactionDetailsController = new GetAdminTransactionDetailsController(getAdminTransactionDetailsUseCase);

export { getAdminTransactionDetailsUseCase, getAdminTransactionDetailsController };
