import { PrismaBusinessClubRepository } from "../../../repositories/implementations-business-club/prisma-business-club.repository";
import { SearchBusinessClubController } from "./search-business-club.controller";

const businessClubRepository = new PrismaBusinessClubRepository();

const searchBusinessClubController = new SearchBusinessClubController(
  businessClubRepository
);

export { searchBusinessClubController };
