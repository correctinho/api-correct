import { CategoriesPrismaRepository } from "../../repositories/implementations/category.prisma.repository";
import { FindCategoryController } from "./find-category.controller";

const categoryRepository = new CategoriesPrismaRepository()
const findCategoryController = new FindCategoryController(categoryRepository);

export { findCategoryController };
