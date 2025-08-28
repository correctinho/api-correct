import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ProductEntity, ProductCreateCommand, ProductProps } from "../product.entity";
import { ProductType } from "@prisma/client"; // Importar o enum

describe('ProductEntity Unit Tests', () => {
    const categoryUuid = new Uuid();
    const businessUuid = new Uuid();
    const userUuid = new Uuid();

    const validPhysicalCommand: ProductCreateCommand = {
        category_uuid: categoryUuid,
        business_info_uuid: businessUuid,
        created_by_uuid: userUuid,
        name: 'Notebook Pro',
        brand: 'CorrectTech',
        original_price: 5000.00,
        discount: 10,
        stock: 50,
    };

    describe('Criação (Create e Hydrate)', () => {
        it('deve criar uma entidade de produto FÍSICO corretamente', () => {
            const entity = ProductEntity.create(validPhysicalCommand);
            const json = entity.toJSON();

            expect(json.original_price).toBe(500000);
            expect(json.discount).toBe(100000);
            expect(json.promotional_price).toBe(450000);
            expect(json.product_type).toBe(ProductType.PHYSICAL);
            expect(json.stock).toBe(50);
        });

        it('deve hidratar uma entidade corretamente', () => {
            const props: ProductProps = {
                uuid: new Uuid(),
                category_uuid: categoryUuid,
                business_info_uuid: businessUuid,
                created_by_uuid: userUuid,
                updated_by_uuid: userUuid,
                product_type: ProductType.PHYSICAL,
                name: 'Mouse Gamer',
                brand: 'CorrectTech',
                original_price: 25000,
                discount: 150000,
                promotional_price: 21250,
                stock: 100,
                image_urls: [],
                is_mega_promotion: false,
                is_active: true,
                ean_code: null,
                description: null,
            };
            const entity = ProductEntity.hydrate(props);

            expect(entity.discount).toBe(15);
            expect(entity.toJSON().discount).toBe(150000);
        });
    });

    // ====================================================================
    // <<< TESTES ESPECÍFICOS PARA A LÓGICA DE PRODUCT TYPE >>>
    // ====================================================================
    describe('Lógica de ProductType (Físico vs. Serviço)', () => {
        it('deve criar um produto do tipo SERVICE com sucesso, definindo o estoque padrão como 1', () => {
            const serviceCommand: ProductCreateCommand = {
                ...validPhysicalCommand,
                product_type: ProductType.SERVICE,
                stock: 0, // O input pode ser 0 ou qualquer outro número, a entidade deve ajustar
            };
            const entity = ProductEntity.create(serviceCommand);
            const json = entity.toJSON();

            expect(json.product_type).toBe(ProductType.SERVICE);
            expect(json.stock).toBe(1); // Conforme a regra de negócio que definimos
        });

        it('deve lançar um erro ao criar um produto FÍSICO com estoque inválido (negativo)', () => {
            const invalidPhysicalCommand: ProductCreateCommand = {
                ...validPhysicalCommand,
                product_type: ProductType.PHYSICAL,
                stock: -10, // Estoque inválido
            };
            expect(() => {
                ProductEntity.create(invalidPhysicalCommand);
            }).toThrow('Stock must be a non-negative integer for physical products.');
        });

        it('NÃO deve lançar erro de estoque ao criar um SERVIÇO, mesmo que o estoque de entrada seja inválido', () => {
            const serviceCommandWithInvalidStock: ProductCreateCommand = {
                ...validPhysicalCommand,
                product_type: ProductType.SERVICE,
                stock: -10, // A lógica deve ignorar este valor e setar o padrão 1
            };

            // Usamos um bloco expect().not.toThrow() para garantir que a criação seja bem-sucedida
            expect(() => {
                const entity = ProductEntity.create(serviceCommandWithInvalidStock);
                expect(entity.toJSON().stock).toBe(1);
            }).not.toThrow();
        });
    });
});
