import { BenefitGroupsPrismaRepository } from "../../repositories/implementations/benefit-groups.prisma.repository";
import { GetAllBenefitGroupsByEmployerController } from "./get-all-by-employer.controller";

const benefitGroupsRepository = new BenefitGroupsPrismaRepository()
const getAllBenefitGroupsController = new GetAllBenefitGroupsByEmployerController(
  benefitGroupsRepository
)

export { getAllBenefitGroupsController }
