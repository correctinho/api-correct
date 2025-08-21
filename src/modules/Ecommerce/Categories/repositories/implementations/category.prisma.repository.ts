import { ICategoriesRepository } from "../categories.repository";
import { CategoryEntity, CategoryProps } from "../../entities/categories.entity";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class CategoriesPrismaRepository implements ICategoriesRepository {

  private hydrate(categoryData: any): CategoryEntity {
    if (!categoryData) return null;

    const categoryProps: CategoryProps = {
      uuid: new Uuid(categoryData.uuid),
      name: categoryData.name,
      description: categoryData.description,
      is_active: categoryData.is_active,
      created_at: categoryData.created_at,
      updated_at: categoryData.updated_at,
    };
    return CategoryEntity.hydrate(categoryProps);
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await prismaClient.categories.findFirst({
      where: { name },
    });
    return this.hydrate(category);
  }

  async create(entity: CategoryEntity): Promise<void> {
    const dataToSave = entity.toJSON();
    await prismaClient.categories.create({
      data: {
        uuid: dataToSave.uuid,
        name: dataToSave.name,
        description: dataToSave.description,
        is_active: dataToSave.is_active,
        created_at: dataToSave.created_at,
        updated_at: dataToSave.updated_at,
      }
    });
  }

  async update(entity: CategoryEntity): Promise<void> {
    const dataToSave = entity.toJSON();
    await prismaClient.categories.update({
      where: { uuid: dataToSave.uuid },
      data: {
        name: dataToSave.name,
        description: dataToSave.description,
        is_active: dataToSave.is_active,
        updated_at: dataToSave.updated_at
      }
    });
  }

  async find(uuid: Uuid): Promise<CategoryEntity | null> {
    const category = await prismaClient.categories.findUnique({
      where: { uuid: uuid.uuid },
    });
    return this.hydrate(category);
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await prismaClient.categories.findMany();
    return categories.map(category => this.hydrate(category));
  }
}
