import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { ProductEntity } from "../../../Products/entities/product.entity";
import { CartEntity, CartProps } from "../cart.entity";
import { ProductType }from "@prisma/client"; // Importar o enum
// Mock da função de data para garantir que os testes sejam determinísticos
jest.mock("../../../../../utils/date", () => ({
    newDateF: () => '2025-08-27T12:00:00',
}));

// Mock simplificado da ProductEntity para os testes
const createMockProduct = (productUuid: Uuid, price: number, stock: number, businessId: Uuid, type: ProductType = ProductType.PHYSICAL): ProductEntity => {
    const product = {
        uuid: productUuid,
        promotional_price: price,
        stock: stock,
        business_info_uuid: businessId,
        product_type: type,
        name: `Product ${productUuid.uuid}`
    } as ProductEntity;
    return product;
};


describe('CartEntity Unit Tests', () => {
    let userUuid: Uuid;
    let businessUuid: Uuid;
    let product1: ProductEntity;
    let product2: ProductEntity;

    beforeEach(() => {
        userUuid = new Uuid();
        businessUuid = new Uuid();
        product1 = createMockProduct(new Uuid(), 10.50, 10, new Uuid(businessUuid.uuid));
        product2 = createMockProduct(new Uuid(), 20.00, 5, new Uuid(businessUuid.uuid));
    });

    describe('Criação e Estado Inicial', () => {
        it('deve criar um carrinho vazio corretamente', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });

            expect(cart.uuid).toBeInstanceOf(Uuid);
            expect(cart.user_info_uuid).toBe(userUuid);
            expect(cart.business_info_uuid).toBe(businessUuid);
            expect(cart.items).toEqual([]);
            expect(cart.total).toBe(0);
        });
    });

    describe('Método addItem', () => {
        it('deve adicionar um novo item ao carrinho', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1, 2);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].product.uuid).toBe(product1.uuid);
            expect(cart.items[0].quantity).toBe(2);
        });

        it('deve aumentar a quantidade de um item existente', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1, 1);
            cart.addItem(product1, 2); // Adiciona o mesmo produto novamente

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].quantity).toBe(3);
        });

        it('deve lançar um erro ao tentar adicionar um produto de outra loja', () => {
            const anotherBusinessUuid = new Uuid();
            const productFromAnotherStore = createMockProduct(new Uuid(), 50, 10, new Uuid(anotherBusinessUuid.uuid));
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });

            expect(() => {
                cart.addItem(productFromAnotherStore);
            }).toThrow("Este produto não pertence à loja deste carrinho.");
        });
    });

    describe('Métodos removeItem e updateItemQuantity', () => {
        it('deve remover um item do carrinho', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1);
            cart.addItem(product2);

            cart.removeItem(product1.uuid);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].product.uuid).toBe(product2.uuid);
        });

        it('deve atualizar a quantidade de um item', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1, 1);
            
            cart.updateItemQuantity(product1.uuid, 5);
            
            expect(cart.items[0].quantity).toBe(5);
        });

        it('deve remover um item se a quantidade for atualizada para zero ou menos', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1);
            cart.addItem(product2);

            cart.updateItemQuantity(product1.uuid, 0);

            expect(cart.items).toHaveLength(1);
            expect(cart.items[0].product.uuid).toBe(product2.uuid);
        });
    });

    describe('Cálculo do Total', () => {
        it('deve calcular o valor total do carrinho corretamente', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1, 2); // 2 * 10.50 = 21.00
            cart.addItem(product2, 1); // 1 * 20.00 = 20.00

            expect(cart.total).toBe(41.00);
        });

        it('deve retornar 0 para um carrinho vazio', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            expect(cart.total).toBe(0);
        });
    });

    describe('Método toJSON', () => {
        it('deve serializar o carrinho para um objeto JSON simples', () => {
            const cart = CartEntity.create({ user_info_uuid: userUuid, business_info_uuid: businessUuid });
            cart.addItem(product1, 2);
            const json = cart.toJSON();

            expect(json.uuid).toBe(cart.uuid.uuid);
            expect(json.user_info_uuid).toBe(userUuid.uuid);
            expect(json.business_info_uuid).toBe(businessUuid.uuid);
            expect(json.total_in_cents).toBe(2100); // 21.00 * 100
            expect(json.items).toHaveLength(1);
            expect(json.items[0].product_uuid).toBe(product1.uuid.uuid);
            expect(json.items[0].quantity).toBe(2);
        });
    });
});