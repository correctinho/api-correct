import { CorrectAdminPrismaRepository } from "../../../../CorrectAdmin/repositories/implementations/correct-admin.prisma.repository";
import { CategoriesPrismaRepository } from "../../repositories/implementations/category.prisma.repository";
import { CreateCategoryController } from "./create-category.controller";

const categoryRepository = new CategoriesPrismaRepository();
const correctAdminRepository = new CorrectAdminPrismaRepository();
const createCategoryController = new CreateCategoryController(categoryRepository, correctAdminRepository);
export { createCategoryController };
