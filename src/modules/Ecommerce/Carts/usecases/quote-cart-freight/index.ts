import { QuoteCartFreightController } from "./quote-cart-freight.controller";
import { QuoteCartFreightUseCase } from "./quote-cart-freight.usecase";
import { CartPrismaRepository } from "../../repositories/implementations/cart-prisma.repository";
import { PartnerConfigPrismaRepository } from "../../../../Company/PartnerConfig/repositories/implementations/prisma/partner-config-prisma.repository";
import { TaxiMachineProvider } from "../../../../../infra/providers/deliveries/TaxiMachineProvider/TaxiMachineProvider";

// 1. Instanciamos os repositórios e provedores (Infraestrutura)
const cartRepository = new CartPrismaRepository();
const partnerConfigRepository = new PartnerConfigPrismaRepository();
const deliveryProvider = new TaxiMachineProvider();

// 2. Injetamos as dependências no UseCase (Domínio)
const quoteCartFreightUseCase = new QuoteCartFreightUseCase(
    cartRepository,
    partnerConfigRepository,
    deliveryProvider
);

// 3. Injetamos o UseCase no Controller (Apresentação)
const quoteCartFreightController = new QuoteCartFreightController(quoteCartFreightUseCase);

export { quoteCartFreightController };