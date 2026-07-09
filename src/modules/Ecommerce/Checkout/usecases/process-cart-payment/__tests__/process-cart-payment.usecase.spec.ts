import { ProcessCartPaymentUseCase } from "../process-cart-payment.usecase";
import { Uuid } from "../../../../../../@shared/ValueObjects/uuid.vo";

describe("ProcessCartPaymentUseCase", () => {
    let processCartPaymentUseCase: ProcessCartPaymentUseCase;
    let mockCartRepository: any;
    let mockUserItemRepository: any;
    let mockPartnerConfigRepository: any;
    let mockEcommerceCheckoutRepository: any;
    let mockDeliveryProvider: any;
    let mockCompanyAddressRepository: any;
    let mockUserInfoRepository: any;

    beforeEach(() => {
        mockCartRepository = {
            findCartById: jest.fn()
        };
        mockUserItemRepository = {
            find: jest.fn()
        };
        mockPartnerConfigRepository = {
            findByPartnerId: jest.fn()
        };
        mockEcommerceCheckoutRepository = {
            processCheckout: jest.fn()
        };
        mockDeliveryProvider = {
            createDelivery: jest.fn()
        };
        mockCompanyAddressRepository = {
            findById: jest.fn()
        };
        mockUserInfoRepository = {
            find: jest.fn()
        };

        processCartPaymentUseCase = new ProcessCartPaymentUseCase(
            mockCartRepository,
            mockUserItemRepository,
            mockPartnerConfigRepository,
            mockEcommerceCheckoutRepository,
            mockDeliveryProvider,
            mockCompanyAddressRepository,
            mockUserInfoRepository
        );
    });

    it("deve processar o pagamento do carrinho com sucesso", async () => {
        // Arrange
        const mockInput = {
            cart_uuid: new Uuid().uuid,
            payment_method_uuid: new Uuid().uuid,
            appUserInfoID: new Uuid().uuid,
            appUserUUID: new Uuid().uuid
        };

        const benefitUuid = new Uuid().uuid;

        // setup cart mock
        mockCartRepository.findCartById.mockResolvedValue({
            user_info_uuid: { uuid: mockInput.appUserInfoID },
            business_info_uuid: { uuid: new Uuid().uuid },
            items: [
                {
                    quantity: 1,
                    product: { price_in_cents: 1000 }
                }
            ],
            freight_amount: 500,
            calculateTotalInCents: () => 1000,
            destination_address: {
                line1: "Rua Teste",
                line2: "123",
                neighborhood: "Centro",
                city: "Campo Grande",
                state: "MS",
                latitude: -20,
                longitude: -54
            }
        });

        // setup user item mock
        mockUserItemRepository.find.mockResolvedValue({
            uuid: new Uuid(),
            user_info_uuid: { uuid: mockInput.appUserInfoID },
            status: "active",
            item_category: "pre_pago",
            balance: 2000, // 20 reais, suficiente para cobrir frete + itens (1500)
            item_uuid: { uuid: benefitUuid }
        });

        // setup partner config mock
        mockPartnerConfigRepository.findByPartnerId.mockResolvedValue({
            items_uuid: [benefitUuid],
            dispatch_address_uuid: new Uuid().uuid,
            cashback_tax: 0,
            admin_tax: 0,
            marketing_tax: 0,
            market_place_tax: 0
        });

        // setup address and user profile mock
        mockCompanyAddressRepository.findById.mockResolvedValue({
            line1: "Rua Loja",
            neighborhood: "Centro",
            city: "Campo Grande",
            state: "MS",
            latitude: -20.1,
            longitude: -54.1
        });

        mockUserInfoRepository.find.mockResolvedValue({
            full_name: "Cliente Teste",
            phone: "67999999999"
        });

        // checkout
        mockEcommerceCheckoutRepository.processCheckout.mockResolvedValue({
            ecommerce_order_uuid: new Uuid().uuid,
            delivery_status: "CREATED"
        });

        // Act
        const result = await processCartPaymentUseCase.execute(mockInput);

        // Assert
        expect(result).toBeDefined();
        expect(result.ecommerce_order_uuid).toBeDefined();
        expect(result.transaction_uuid).toBeDefined();
        expect(result.delivery_status).toBe("CREATED");

        // Verifica se todas as dependências foram chamadas corretamente
        expect(mockCartRepository.findCartById).toHaveBeenCalled();
        expect(mockUserItemRepository.find).toHaveBeenCalled();
        expect(mockPartnerConfigRepository.findByPartnerId).toHaveBeenCalled();
        expect(mockCompanyAddressRepository.findById).toHaveBeenCalled();
        expect(mockUserInfoRepository.find).toHaveBeenCalled();
        expect(mockEcommerceCheckoutRepository.processCheckout).toHaveBeenCalled();
        expect(mockDeliveryProvider.createDelivery).toHaveBeenCalled();
    });

    it("deve lançar erro se o carrinho não for encontrado", async () => {
        // Arrange
        mockCartRepository.findCartById.mockResolvedValue(null);
        
        // Act & Assert
        await expect(processCartPaymentUseCase.execute({
            cart_uuid: new Uuid().uuid,
            payment_method_uuid: new Uuid().uuid,
            appUserInfoID: new Uuid().uuid,
            appUserUUID: new Uuid().uuid
        })).rejects.toThrow("Carrinho não encontrado.");
    });

    it("deve lançar erro se o carrinho não pertencer ao usuário", async () => {
        // Arrange
        const mockInput = {
            cart_uuid: new Uuid().uuid,
            payment_method_uuid: new Uuid().uuid,
            appUserInfoID: new Uuid().uuid,
            appUserUUID: new Uuid().uuid
        };

        mockCartRepository.findCartById.mockResolvedValue({
            user_info_uuid: { uuid: new Uuid().uuid }, // UUID diferente do input
            business_info_uuid: { uuid: new Uuid().uuid },
            items: []
        });

        // Act & Assert
        await expect(processCartPaymentUseCase.execute(mockInput))
            .rejects.toThrow("Este carrinho não pertence a este usuário.");
    });

    it("deve lançar erro se o saldo for insuficiente", async () => {
        // Arrange
        const mockInput = {
            cart_uuid: new Uuid().uuid,
            payment_method_uuid: new Uuid().uuid,
            appUserInfoID: new Uuid().uuid,
            appUserUUID: new Uuid().uuid
        };

        const benefitUuid = new Uuid().uuid;

        mockCartRepository.findCartById.mockResolvedValue({
            user_info_uuid: { uuid: mockInput.appUserInfoID },
            business_info_uuid: { uuid: new Uuid().uuid },
            items: [
                { quantity: 1, product: { price_in_cents: 2000 } } // Total 20 reais
            ],
            freight_amount: 1000, // + 10 reais de frete (Total: 3000)
            calculateTotalInCents: () => 2000
        });

        mockUserItemRepository.find.mockResolvedValue({
            uuid: new Uuid(),
            user_info_uuid: { uuid: mockInput.appUserInfoID },
            status: "active",
            item_category: "pre_pago",
            balance: 1000, // Apenas 10 reais na conta
            item_uuid: { uuid: benefitUuid }
        });

        mockPartnerConfigRepository.findByPartnerId.mockResolvedValue({
            items_uuid: [benefitUuid]
        });

        // Act & Assert
        await expect(processCartPaymentUseCase.execute(mockInput))
            .rejects.toThrow("Saldo insuficiente para realizar esta compra.");
    });
});
