import { CategoriesPrismaRepository } from "../../repositories/implementations/category.prisma.repository";
import { FindAllCategoryController } from "./find-all-categories.controller";

const categoryRepository = new CategoriesPrismaRepository();

const findAllCategoriesController = new FindAllCategoryController(categoryRepository)

export { findAllCategoriesController };
