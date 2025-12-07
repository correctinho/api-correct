
// Import do Controller Genérico
import { CompanyDataPrismaRepository } from "../../../../Company/CompanyData/repositories/implementations/prisma/company-data-prisma.repository";
import { ProductPrismaRepository } from "../../../../Ecommerce/Products/repositories/implementations/product-prisma.repository";
import { ServiceRequestPrismaRepository } from "../../../repositories/implementations/ServiceRequestPrismaRepository";
import { ListUserRequestsController } from "./ListUserRequestsController";

// 1. Instanciar os repositórios concretos
const serviceRequestRepository = new ServiceRequestPrismaRepository();
// Assumindo que estes repositórios já existem e não precisam de argumentos no construtor
const companyDataRepository = new CompanyDataPrismaRepository();
const productsRepository = new ProductPrismaRepository();

// 2. Injetar as dependências no Controller
const listUserRequestsController = new ListUserRequestsController(
    serviceRequestRepository,
    companyDataRepository,
    productsRepository
);

// 3. Exportar a instância do controller pronta para uso nas rotas
export { listUserRequestsController };