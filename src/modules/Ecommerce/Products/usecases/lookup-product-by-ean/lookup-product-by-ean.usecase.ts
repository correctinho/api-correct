import { CustomError } from "../../../../../errors/custom.error";
import { IEanCatalogProvider } from "../../../../../infra/providers/ean-catalog/ean-catalog.provider";
import { OutputLookupEanDTO } from "./lookup-product-by-ean.dto";

export class LookupProductByEanUseCase {
  constructor(private eanCatalogProvider: IEanCatalogProvider) {}

  async execute(ean: string): Promise<OutputLookupEanDTO> {
    const product = await this.eanCatalogProvider.findProduct(ean);

    if (!product) {
      throw new CustomError("Produto não encontrado para o EAN informado", 404);
    }

    return product;
  }
}
