import axios from "axios";
import { IEanCatalogProvider } from "../ean-catalog.provider";
import { OutputLookupEanDTO } from "../../../../modules/Ecommerce/Products/usecases/lookup-product-by-ean/lookup-product-by-ean.dto";

export class OpenFoodFactsProvider implements IEanCatalogProvider {
  async findProduct(ean: string): Promise<OutputLookupEanDTO | null> {
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`);

      if (response.data && response.data.status === 1) {
        const product = response.data.product;
        return {
          description: product.product_name,
          thumbnail: product.image_front_url,
          brand: product.brands,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
