import RepositoryInterface from "../../../../@shared/domain/repository/repository-interface";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { CartEntity } from "../entities/cart.entity";

export interface ICartRepository extends RepositoryInterface<CartEntity> {
    findByUserAndBusiness(userId: Uuid, businessId: Uuid): Promise<CartEntity | null>
    findCartByItemId(cartItemId: Uuid): Promise<CartEntity | null>
    deleteCartItem(cartItemId: Uuid): Promise<void>
    findAllByUserId(userId: Uuid): Promise<CartEntity[]>;
    findCartById(cartId: Uuid): Promise<CartEntity | null>;
    findById(uuid: string): Promise<any>;
    updateFreight(cartId: Uuid, data: { amount: number, minutes: number, lat: number, lng: number, address: string, quoted_at: Date }): Promise<void>;
}