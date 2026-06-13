import { OutputLookupEanDTO } from "../../../modules/Ecommerce/Products/usecases/lookup-product-by-ean/lookup-product-by-ean.dto";

export interface IEanCatalogProvider {
  findProduct(ean: string): Promise<OutputLookupEanDTO | null>;
}
