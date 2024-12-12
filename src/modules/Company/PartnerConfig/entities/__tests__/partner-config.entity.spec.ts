import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { PartnerConfigEntity, PartnerConfigProps } from '../partner-config.entity';


const validInput: PartnerConfigProps = {
  business_info_uuid: new Uuid(),
  partner_category: ['saude', 'cultura'], // Agora pode ter múltiplos valores
  items_uuid: [new Uuid().toString(), new Uuid().toString()],
  admin_tax: 10,
  marketing_tax: 5,
  cycle_start_date: '2024-01-01',
  cycle_end_date: '2024-12-31',
  cycle_paper_payment_date: '2024-06-15',
};

describe('Unit Test PartnerConfig Entity', () => {
  it('Should throw an error if business_info_uuid is missing', () => {
    const input = { ...validInput, business_info_uuid: undefined as unknown as Uuid };

    expect(() => {
      new PartnerConfigEntity(input);
    }).toThrow('Business Info UUID is required');
  });

  it('Should throw an error if partner_category is empty', () => {
    const input = { ...validInput, partner_category: [] };

    expect(() => {
      new PartnerConfigEntity(input);
    }).toThrow('At least one partner category is required');
  });

  it('Should throw an error if partner_category has an invalid value', () => {
    const input = { ...validInput, partner_category: ['invalid'] as any };

    expect(() => {
      new PartnerConfigEntity(input);
    }).toThrow('Invalid partner category: invalid');
  });

  it('Should throw an error if items_uuid is empty', () => {
    const input = { ...validInput, items_uuid: [] };

    expect(() => {
      new PartnerConfigEntity(input);
    }).toThrow('Items UUID is required and must be a non-empty array');
  });

  it('Should throw an error if admin_tax is negative', () => {
    const input = { ...validInput, admin_tax: -5 };

    expect(() => {
      new PartnerConfigEntity(input);
    }).toThrow('Admin tax must be a positive number');
  });

  it('Should throw an error if marketing_tax is negative', () => {
    const input = { ...validInput, marketing_tax: -3 };

    expect(() => {
      new PartnerConfigEntity(input);
    }).toThrow('Marketing tax must be a positive number');
  });

  it('Should create a PartnerConfig entity successfully', () => {
    const partnerConfig = new PartnerConfigEntity(validInput);

    expect(partnerConfig.uuid).toBeInstanceOf(Uuid);
    expect(partnerConfig.business_info_uuid).toBe(validInput.business_info_uuid);
    expect(partnerConfig.partner_category).toEqual(validInput.partner_category);
    expect(partnerConfig.items_uuid).toEqual(validInput.items_uuid);
    expect(partnerConfig.admin_tax).toBe(validInput.admin_tax);
    expect(partnerConfig.marketing_tax).toBe(validInput.marketing_tax);
    expect(partnerConfig.cycle_start_date).toBe(validInput.cycle_start_date);
    expect(partnerConfig.cycle_end_date).toBe(validInput.cycle_end_date);
    expect(partnerConfig.cycle_paper_payment_date).toBe(validInput.cycle_paper_payment_date);
  });
});
