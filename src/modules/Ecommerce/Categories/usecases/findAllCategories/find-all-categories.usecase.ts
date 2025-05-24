import { CustomError } from '../../../../../errors/custom.error';
import { ICategoriesRepository } from '../../repositories/categories.repository';
import { OutputFindCategoryDTO } from '../findCategory/dto/find-category.dto';

export class FindAllCategoryUsecase {
  constructor(private categoryRepository: ICategoriesRepository) {}

  async execute(): Promise<OutputFindCategoryDTO[]> {
    const findAllCategories = await this.categoryRepository.findAll();
    if (findAllCategories.length === 0) {
      throw new CustomError('Categories not found', 404);
    }
    return findAllCategories.map((category) => ({
      uuid: category.uuid.uuid,
      name: category.name,
      description: category.description,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));
  }
}
