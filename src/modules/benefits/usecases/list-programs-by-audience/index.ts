import { BenefitPrismaRepository } from "../../repositories/implementations/benefit.prisma.repository";
import { ListProgramsByAudienceController } from "./list-programs-by-audience.controller";
import { ListProgramsByAudienceUseCase } from "./list-programs-by-audience.usecase";

const benefitRepository = new BenefitPrismaRepository();
const listProgramsByAudienceUseCase = new ListProgramsByAudienceUseCase(benefitRepository);
export const listProgramsByAudienceController = new ListProgramsByAudienceController(listProgramsByAudienceUseCase);
