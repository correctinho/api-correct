import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../../errors/custom.error';
import { ICategoriesRepository } from '../../repositories/categories.repository';
import {
  InputFindCategoryDTO,
  OutputFindCategoryDTO,
} from './dto/find-category.dto';

export class FindCategoryUsecase {
  constructor(private categoryRepository: ICategoriesRepository) {}

  async execute(data: InputFindCategoryDTO): Promise<OutputFindCategoryDTO> {
    if (!data.category_uuid) {
      throw new CustomError('UUID is required', 400);
    }
    const findCategory = await this.categoryRepository.find(new Uuid(data.category_uuid));
    if (!findCategory)
      throw new CustomError('Category not found', 404);

    return {
      uuid: findCategory.uuid.uuid,
      name: findCategory.name,
      description: findCategory.description,
      created_at: findCategory.created_at,
      updated_at: findCategory.updated_at,
    };
  }
}
