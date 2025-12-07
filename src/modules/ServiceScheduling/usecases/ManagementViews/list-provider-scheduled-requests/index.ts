
// Import do Controller Genérico
import { AppUserInfoPrismaRepository } from "../../../../AppUser/AppUserManagement/repositories/implementations-user-info/app-user-info-prisma.repository";
import { ProductPrismaRepository } from "../../../../Ecommerce/Products/repositories/implementations/product-prisma.repository";
import { ConfirmedAppointmentPrismaRepository } from "../../../repositories/implementations/ConfirmedAppointmentPrismaRepository";
import { ServiceRequestPrismaRepository } from "../../../repositories/implementations/ServiceRequestPrismaRepository";
import { ListProviderScheduledRequestsController } from "./ListProviderScheduledRequestsController";

// 1. Instanciar os repositórios concretos
const serviceRequestRepository = new ServiceRequestPrismaRepository();
const confirmedAppointmentRepository = new ConfirmedAppointmentPrismaRepository();
// Assumindo construtores sem argumentos
const userInfoRepository = new AppUserInfoPrismaRepository();
const productsRepository = new ProductPrismaRepository();

// 2. Injetar as dependências no Controller
const listProviderScheduledController = new ListProviderScheduledRequestsController(
    serviceRequestRepository,
    confirmedAppointmentRepository,
    userInfoRepository,
    productsRepository
);

// 3. Exportar a instância do controller pronta para uso nas rotas
export { listProviderScheduledController };