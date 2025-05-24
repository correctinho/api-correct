import { FileDTO } from "../../../modules/Ecommerce/Products/entities/products.entity";

export abstract class IStorage {
  abstract upload(file: FileDTO, folder: string): Promise<any>;
  abstract delete(filePath: string): Promise<void>;
}
