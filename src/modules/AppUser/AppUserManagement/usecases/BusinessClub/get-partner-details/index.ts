import { PrismaBusinessClubRepository } from "../../../repositories/implementations-business-club/prisma-business-club.repository";
import { GetPartnerDetailsController } from "./get-partner-details.controller";

const prismaBusinessClubRepository = new PrismaBusinessClubRepository();
export const getPartnerDetailsController = new GetPartnerDetailsController(prismaBusinessClubRepository);
