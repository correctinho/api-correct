import { N8nNotifierProvider } from "../../../../../infra/providers/NotifierProvider/implementations/N8nNotifierProvider";
import { ServiceRequestPrismaRepository } from "../../../repositories/implementations/ServiceRequestPrismaRepository";
import { SuggestSlotsController } from "./SuggestSlotsController";

const serviceRequestRepository =new ServiceRequestPrismaRepository()
const notifierProvider = new N8nNotifierProvider()

const suggestSlotsController = new SuggestSlotsController(
    serviceRequestRepository,
    notifierProvider
)

export { suggestSlotsController}