import { Request, Response } from "express";
import { ICategoriesRepository } from "../../repositories/categories.repository";
import { FindAllCategoryUsecase } from "./find-all-categories.usecase";

export class FindAllCategoryController {
  constructor(private categoryRepository: ICategoriesRepository) { }
  async handle(req: Request, res: Response) {
    try {
      const usecase = new FindAllCategoryUsecase(this.categoryRepository);
      const result = await usecase.execute();
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }

}
