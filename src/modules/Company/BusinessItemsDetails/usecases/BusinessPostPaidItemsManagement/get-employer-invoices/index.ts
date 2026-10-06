import { GetEmployerInvoicesController } from "./get-employer-invoices.controller";
import { InvoicesPrismaRepository } from "../../../../../Invoices/infra/databases/prisma/repositories/invoices.prisma.repository";
import { ListInvoicesUsecase } from "../../../../../Invoices/application/usecases/list-invoices.usecase";

const invoicesRepository = new InvoicesPrismaRepository();
const listInvoicesUsecase = new ListInvoicesUsecase(invoicesRepository);
const getEmployerInvoicesController = new GetEmployerInvoicesController(listInvoicesUsecase);

export { getEmployerInvoicesController };
