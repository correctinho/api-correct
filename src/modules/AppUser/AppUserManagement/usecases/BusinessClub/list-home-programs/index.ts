import { PrismaBusinessClubRepository } from "../../../repositories/implementations-business-club/prisma-business-club.repository";
import { ListHomeProgramsController } from "./list-home-programs.controller";

const businessClubRepository = new PrismaBusinessClubRepository();

const listHomeProgramsController = new ListHomeProgramsController(
  businessClubRepository
);

export { listHomeProgramsController };
