import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ProductEntity, ProductCreateCommand, ProductProps } from "../product.entity";

describe('ProductEntity Unit Tests', () => {
    const categoryUuid = new Uuid();
    const businessUuid = new Uuid();

    const validCommand: ProductCreateCommand = {
        category_uuid: categoryUuid,
        business_info_uuid: businessUuid,
        name: 'Notebook Pro',
        brand: 'CorrectTech',
        original_price: 5000.00, // R$ 5000,00
        discount: 10, // 10%
        stock: 50,
    };

    describe('Criação (Create e Hydrate)', () => {
        it('deve criar uma entidade e converter preços e descontos corretamente', () => {
            const entity = ProductEntity.create(validCommand);
            const json = entity.toJSON();

            expect(json.original_price).toBe(500000); // 5000 * 100
            expect(json.discount).toBe(100000); // 10 * 10000
            expect(json.promotional_price).toBe(450000); // 500000 - 10%
            
            // Getters devem retornar valores formatados para exibição
            expect(entity.original_price).toBe(5000.00);
            expect(entity.promotional_price).toBe(4500.00);
            expect(entity.discount).toBe(10);
        });

        it('deve hidratar uma entidade com dados do banco (escalados)', () => {
            const props: ProductProps = {
                category_uuid: categoryUuid,
                business_info_uuid: businessUuid,
                name: 'Mouse Gamer',
                brand: 'CorrectTech',
                original_price: 25000, // R$ 250,00
                discount: 150000, // 15%
                promotional_price: 21250, // R$ 212,50
                stock: 100,
                images_url: [],
                is_mega_promotion: false,
                is_active: true,
                ean_code: null,
                description: null,
            };
            const entity = ProductEntity.hydrate(props);
            
            expect(entity.discount).toBe(15); // Getter deve retornar 15
            expect(entity.toJSON().discount).toBe(150000); // toJSON deve retornar o valor bruto
        });
    });

    describe('Validações de Preço', () => {
        it('deve lançar um erro se o preço promocional for maior que o original', () => {
            // Forçamos um estado inválido para testar a validação no construtor
            const invalidProps: ProductProps = {
                category_uuid: validCommand.category_uuid,
                business_info_uuid: validCommand.business_info_uuid,
                name: validCommand.name,
                brand: validCommand.brand,
                stock: validCommand.stock,
                original_price: 500000,
                promotional_price: 500001, // Preço promocional maior
                discount: 100000,
                images_url: [],
                is_active: true,
                is_mega_promotion: false,
                ean_code: null,
                description: null,
            }

            expect(() => ProductEntity.hydrate(invalidProps)).toThrow('O preço promocional deve ser menor que o preço original quando um desconto é aplicado.');
        });
    });
});