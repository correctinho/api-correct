
import { CustomError } from '../../../errors/custom.error';
import { BenefitsEntity, BenefitsProps } from './benefit.entity';

describe('Benefit unit tests', () => {
    const validInput: BenefitsProps = {
        name: 'Benefit name',
        description: 'benefit description',
        item_type: 'gratuito',
        item_category: 'pos_pago',
    };

    it('Should throw error if name is empty', () => {
        const input = { ...validInput, name: '' };
        expect(() => {
            new BenefitsEntity(input);
        }).toThrow(CustomError);
        expect(() => {
            new BenefitsEntity(input);
        }).toThrow('Name is required');
    });

    it('Should throw error if description is empty', () => {
        const input = { ...validInput, description: '' };
        expect(() => {
            new BenefitsEntity(input);
        }).toThrow(CustomError);
        expect(() => {
            new BenefitsEntity(input);
        }).toThrow('Description is required');
    });

    
    it('Should change name', () => {
        const benefit = new BenefitsEntity(validInput);
        benefit.changeName('New name');
        expect(benefit.name).toBe('New name');
    });

    it('Should change description', () => {
        const benefit = new BenefitsEntity(validInput);
        benefit.changeDescription('New description');
        expect(benefit.description).toBe('New description');
    });

    it('Should change item type', () => {
        const benefit = new BenefitsEntity(validInput);
        benefit.changeItemType('programa');
        expect(benefit.item_type).toBe('programa');
    });

    it('Should change item category', () => {
        const benefit = new BenefitsEntity(validInput);
        benefit.changeItemCategory('pre_pago');
        expect(benefit.item_category).toBe('pre_pago');
    });
});