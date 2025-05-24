import { CategoryEntity } from '../entities/categories.entity';
import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";

export interface ICategoriesRepository extends RepositoryInterface < CategoryEntity > {
  findByName(name: string): Promise<CategoryEntity | null>;
}
