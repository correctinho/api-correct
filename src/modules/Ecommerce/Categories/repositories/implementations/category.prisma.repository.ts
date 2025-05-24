import { ICategoriesRepository } from "../categories.repository";
import { CategoryEntity } from "../../entities/categories.entity";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";

export class CategoriesPrismaRepository implements ICategoriesRepository {


  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await prismaClient.categories.findFirst({
      where: {
        name,
      },
    });

    if(!category) return null
    return {
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    } as CategoryEntity
  }
  async create(entity: CategoryEntity): Promise<void> {
    await prismaClient.categories.create({
      data:{
        uuid: entity.uuid.uuid,
        name: entity.name,
        description: entity.description,
        is_active: entity.is_active,
        created_at: entity.created_at
      }
    })
  }
  async update(entity: CategoryEntity): Promise<void> {
    await prismaClient.categories.update({
      where:{
        uuid: entity.uuid.uuid
      },
      data:{
        name: entity.name,
        description: entity.description,
        updated_at: entity.updated_at
      }
    })
  }
  async find(uuid: Uuid): Promise<CategoryEntity | null> {
    const category = await prismaClient.categories.findUnique({
      where: {
        uuid: uuid.uuid,
      },
    });

    if(!category) return null
    return {
      uuid: new Uuid(category.uuid),
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    } as CategoryEntity
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await prismaClient.categories.findMany();
    return categories.map(category => ({
      uuid: new Uuid(category.uuid),
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    })) as CategoryEntity[];
  }
}
