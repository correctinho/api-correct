import axios from "axios";
import { IEanCatalogProvider } from "../ean-catalog.provider";
import { OutputLookupEanDTO } from "../../../../modules/Ecommerce/Products/usecases/lookup-product-by-ean/lookup-product-by-ean.dto";

export class HttpEanProvider implements IEanCatalogProvider {
  async findProduct(ean: string): Promise<OutputLookupEanDTO | null> {
    try {
      const url = process.env.EAN_API_URL;
      
      if (!url) {
        console.warn("EAN_API_URL environment variable is not defined");
      }

      // Placeholder for external API call
      const requestUrl = url ? `${url}/${ean}` : `https://api.cosmos.bluesoft.com.br/gtins/${ean}`;

      const response = await axios.get(requestUrl, {
        headers: {
          "X-Cosmos-Token": process.env.EAN_API_TOKEN || "token_placeholder"
        }
      });

      if (!response.data) {
        return null;
      }

      const data = response.data;
      
      return {
        description: data.description || "Descrição não disponível",
        thumbnail: data.thumbnail || "https://via.placeholder.com/150",
        brand: data.brand?.name || null,
        manufacturer: data.manufacturer?.name || null,
        ncm: data.ncm?.code || null,
        weight: data.gross_weight || null,
        height: data.height || null,
        width: data.width || null,
        length: data.length || null,
        category: null, 
      };
    } catch (error) {
      console.error(`Error fetching product by EAN ${ean}:`, error);
      return null;
    }
  }
}
