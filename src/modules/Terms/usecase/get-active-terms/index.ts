import { TermsOfServicePrismaRepository } from "../../repositories/implementations/prisma-terms-of-service.repository";
import { GetActiveTermsByTypeController } from "./get-active-terms.controller";

const termsRepository = new TermsOfServicePrismaRepository();
const getActiveTermsByTypeController = new GetActiveTermsByTypeController(termsRepository);

export { getActiveTermsByTypeController };