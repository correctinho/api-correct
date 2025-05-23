import {
  InputCreateCategoryDTO,
  OutputCreateCategoryDTO,
} from './dto/create-category.dto';
import { ICategoriesRepository } from '../../repositories/categories.repository';
// import { CustomError } from 'src/core/errors/custom.error';
import { CategoryEntity } from '../../entities/categories.entity';
import { CustomError } from '../../../../../errors/custom.error';
import { ICorrectAdminRepository } from '../../../../CorrectAdmin/repositories/correct-admin.repository';
import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';

export class CreateCategoryUsecase {
  constructor(
    private categoryRepository: ICategoriesRepository,
    private correctAdminRepository: ICorrectAdminRepository
  ) {}

  async execute(
    data: InputCreateCategoryDTO,
  ): Promise<OutputCreateCategoryDTO> {
    const categoryEntity = CategoryEntity.create(data);
    //aqui deve ser feita uma requisição a api de usuários
    const adminDetails = await this.correctAdminRepository.find(new Uuid(data.correct_admin_uuid));
    if (!adminDetails) throw new CustomError("Admin not found", 404);
    //check if name is already registered
    const categoryByName = await this.categoryRepository.findByName(
      categoryEntity.name,
    );
    if (categoryByName) throw new CustomError("Category already registered", 409);
    //create
    await this.categoryRepository.create(categoryEntity);

    return {
      uuid: categoryEntity.uuid.uuid,
      name: categoryEntity.name,
      description: categoryEntity.description,
      created_at: categoryEntity._created_at,
    };
  }
}
