import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { AppUserItemProps, AppUserItemEntity } from '../app-user-item.entity';
import { UserItemStatus } from '@prisma/client';
import { randomUUID } from 'crypto'

describe("Unit tests AppUserItemEntity", () => {
  describe("Unit Test AppUserItemEntity - Attribute Changes", () => {
    const validInput: AppUserItemProps = {
      user_info_uuid: new Uuid(),
      item_uuid: new Uuid(),
      item_name: 'Item Name',
      balance: 100,
      status: 'active' as UserItemStatus
    };

    it("Should change item name", () => {
      const userItem = new AppUserItemEntity(validInput);
      userItem.changeItemName('New Item Name');

      expect(userItem.item_name).toEqual('New Item Name');
    });

    it("Should change blocked_at date", () => {
      const userItem = new AppUserItemEntity(validInput);
      const newDate = '2024-09-05T00:00:00Z';
      userItem.changeBlockedAt(newDate);

      expect(userItem.blocked_at).toEqual(newDate);
    });

    it("Should change cancelled_at date", () => {
      const userItem = new AppUserItemEntity(validInput);
      const newDate = '2024-09-06T00:00:00Z';
      userItem.changeCancelledAt(newDate);

      expect(userItem.cancelled_at).toEqual(newDate);
    });

    it("Should change block reason", () => {
      const userItem = new AppUserItemEntity(validInput);
      const reason = 'Violation of terms';
      userItem.changeBlockReason(reason);

      expect(userItem.block_reason).toEqual(reason);
    });

    it("Should change cancel reason", () => {
      const userItem = new AppUserItemEntity(validInput);
      const reason = 'User request';
      userItem.changeCancelReason(reason);

      expect(userItem.cancel_reason).toEqual(reason);
    });

    it("Should change grace period end date", () => {
      const userItem = new AppUserItemEntity(validInput);
      const newDate = '2024-10-01T00:00:00Z';
      userItem.changeGracePeriodEndDate(newDate);

      expect(userItem.grace_period_end_date).toEqual(newDate);
    });
  });

  describe("Unit Test AppUserItemEntity - Validations", () => {
    it("Should throw an error if user info uuid is missing", async () => {

      const input: any = {
        user_info_uuid: '',
        item_uuid: randomUUID(),
        balance: 1,
        status: 'status' as UserItemStatus,
        business_info_uuid: randomUUID()
      }

      expect(() => {
        AppUserItemEntity.create(input)
      }).toThrow("User Info id is required")
    })
    it("Should throw an error if item uuid is missing", async () => {

      const input: any = {
        user_info_uuid: randomUUID(),
        item_uuid: '',
        balance: 1,
        status: 'status' as UserItemStatus,
        business_info_uuid: randomUUID()
      }

      expect(() => {
        AppUserItemEntity.create(input)
      }).toThrow("Item id is required")
    })

    it("Should throw an error if balance is negative", async () => {

      const input: any = {
        user_info_uuid: randomUUID(),
        item_uuid: randomUUID(),
        balance: -1,
        status: 'status' as UserItemStatus,
        business_info_uuid: randomUUID()
      }

      expect(() => {
        AppUserItemEntity.create(input)
      }).toThrow("Balance cannot be negative")
    })

    it("Should throw an error if status is invalid", async () => {

      const input: any = {
        user_info_uuid: randomUUID(),
        item_uuid: randomUUID(),
        balance: 1,
        status: 'any status',
        business_info_uuid: randomUUID()
      }

      expect(() => {
        AppUserItemEntity.create(input)
      }).toThrow("Invalid status")
    })
  })
  })
