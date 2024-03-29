import { CardsPrismaRepository } from "../../repositories/implementations/cards-prisma.repository";
import { CreateCardsController } from "./create-update-cards-controller";

const cardsRepository = new CardsPrismaRepository()

const createCardsController = new CreateCardsController(cardsRepository)

export { createCardsController }