import { PartnerConfigPrismaRepository } from "../../repositories/implementations/prisma/partner-config-prisma.repository";
import { UpdatePartnerTaxesController } from "./update-partner-taxes.controller";
import { UpdatePartnerTaxesUsecase } from "./update-partner-taxes.usecase";

const partnerConfigRepository = new PartnerConfigPrismaRepository();
const updatePartnerTaxesUsecase = new UpdatePartnerTaxesUsecase(partnerConfigRepository);
const updatePartnerTaxesController = new UpdatePartnerTaxesController(updatePartnerTaxesUsecase);

export { updatePartnerTaxesController };
