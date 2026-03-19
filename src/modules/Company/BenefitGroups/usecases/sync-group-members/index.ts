import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { BusinessItemDetailsPrismaRepository } from "../../../BusinessItemsDetails/repositories/implementations/business-item-details.prisma.repository";
import { SyncGroupMembersController } from "./sync-group-members.controller";

// 1. Instanciar os repositórios concretos (Prisma)
const benefitGroupsRepository = new BenefitGroupsPrismaRepository();
const businessItemDetailsRepository = new BusinessItemDetailsPrismaRepository();

// 2. Instanciar o Controller injetando as dependências
const syncGroupMembersController = new SyncGroupMembersController(
    benefitGroupsRepository,
    businessItemDetailsRepository
);

// 3. Exportar a instância pronta para as rotas
export { syncGroupMembersController };