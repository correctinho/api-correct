import { BusinessItemDetailsPrismaRepository } from "../../repositories/implementations/business-item-details.prisma.repository";
import { SetEmployerCycleController } from "./set-employer-cycles.controller";

const itemsDetailsRepository = new BusinessItemDetailsPrismaRepository()
const setEmployerCyclesController = new SetEmployerCycleController(itemsDetailsRepository)

export { setEmployerCyclesController }
