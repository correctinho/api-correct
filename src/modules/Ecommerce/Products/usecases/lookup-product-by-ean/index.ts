import { OpenFoodFactsProvider } from "../../../../../infra/providers/ean-catalog/implementations/open-food-facts.provider";
import { LookupProductByEanController } from "./lookup-product-by-ean.controller";
import { LookupProductByEanUseCase } from "./lookup-product-by-ean.usecase";

const eanProvider = new OpenFoodFactsProvider();
const lookupProductByEanUseCase = new LookupProductByEanUseCase(eanProvider);
const lookupProductByEanController = new LookupProductByEanController(lookupProductByEanUseCase);

export { lookupProductByEanController };
