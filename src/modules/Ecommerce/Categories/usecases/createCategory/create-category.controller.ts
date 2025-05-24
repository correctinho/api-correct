import { ICorrectAdminRepository } from "../../../../CorrectAdmin/repositories/correct-admin.repository";
import { ICategoriesRepository } from "../../repositories/categories.repository";
import { Request, Response } from "express";
import { CreateCategoryUsecase } from "./create-category.usecase";

export class CreateCategoryController {
  constructor(
    private categoryRepository: ICategoriesRepository,
    private correctAdminRepository: ICorrectAdminRepository
  ) { }
  async handle(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const data = req.body;
      data.correct_admin_uuid = req.correctAdmin.correctAdminId

      const usecase = new CreateCategoryUsecase(this.categoryRepository, this.correctAdminRepository);

      const output = await usecase.execute(data)
      return res.status(201).json(output);
    } catch (err: any) {
      return res.status(err.statusCode).json({
        error: err.message || "Internal Server Error",
      });
    }
  }
}
