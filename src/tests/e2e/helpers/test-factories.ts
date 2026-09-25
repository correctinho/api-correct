import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../src/infra/databases/prisma.config';
import { BusinessStatus, BusinessTypeOptions } from '@prisma/client';

export async function createTestAddress() {
    const addressId = uuidV4();
    return prismaClient.address.create({
        data: {
            uuid: addressId,
            line1: 'Rua Teste',
            postal_code: '12345678',
            city: 'Cidade Teste',
            state: 'SP',
            country: 'Brasil'
        }
    });
}

export async function createTestBusinessInfo(overrides: any = {}) {
    const businessId = overrides.uuid || uuidV4();
    let address_uuid = overrides.address_uuid;

    if (!address_uuid) {
        const address = await createTestAddress();
        address_uuid = address.uuid;
    }

    const defaultData = {
        uuid: businessId,
        address_uuid,
        document: `${Math.floor(Math.random() * 99999999999999).toString().padStart(14, '0')}`,
        classification: 'A',
        colaborators_number: 1,
        status: BusinessStatus.pending_contract,
        phone_1: '11999999999',
        email: `test-${businessId}@correct.com`,
        business_type: BusinessTypeOptions.comercio,
        created_at: new Date().toISOString()
    };

    return prismaClient.businessInfo.create({
        data: { ...defaultData, ...overrides }
    });
}
