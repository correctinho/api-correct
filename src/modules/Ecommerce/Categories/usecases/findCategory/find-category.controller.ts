import { Request, Response } from "express";
import { ICategoriesRepository } from "../../repositories/categories.repository";
import { FindCategoryUsecase } from "./find-category.usecase";

export class FindCategoryController {
  constructor(private categoryRepository: ICategoriesRepository) { }

  async handle(req: Request, res: Response) {
    try {
      const data = req.body

      const usecase = new FindCategoryUsecase(this.categoryRepository);
      const result = await usecase.execute(data);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }

}
