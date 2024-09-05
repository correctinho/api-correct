import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { BusinessItemsDetailsEntity} from '../businessItemDetails.entity'

describe('BusinessItemsDetailsEntity unit tests', () => {

    const validInput = {
        item_uuid: new Uuid(),
        business_info_uuid: new Uuid(),
        cycle_start_day: 1,
        cycle_end_day: 30
    };


    it('Should change cycle end day and update cycle start day accordingly', () => {
      const itemDetails = new BusinessItemsDetailsEntity(validInput);
      itemDetails.changeCycleEndDay(15);
      expect(itemDetails.cycle_end_day).toBe(15);
      expect(itemDetails.cycle_start_day).toBe(16); // Verifica se o cycle_start_day foi atualizado corretamente
  });

    it('Should create a business item details entity', () => {
        const itemDetails = BusinessItemsDetailsEntity.create(validInput);

        expect(itemDetails.uuid).toBeInstanceOf(Uuid);
        expect(itemDetails.item_uuid).toBe(validInput.item_uuid);
        expect(itemDetails.business_info_uuid).toBe(validInput.business_info_uuid);
        expect(itemDetails.cycle_start_day).toBe(validInput.cycle_start_day);
        expect(itemDetails.cycle_end_day).toBe(validInput.cycle_end_day);
    });
});
