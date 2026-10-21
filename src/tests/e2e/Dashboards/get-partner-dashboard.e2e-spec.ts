import request from 'supertest';
import { app } from '../../../app';
import { prismaClient } from '../../../infra/databases/prisma.config';
import { CompanyAdminJWToken } from '../../../infra/shared/crypto/token/CompanyAdmin/jwt.token';
import { v4 as uuidV4 } from 'uuid';
import { newDateF } from '../../../utils/date';
import { subDays, subMonths } from 'date-fns';
import { TransactionStatus } from '@prisma/client';

describe('E2E - Get Partner Dashboard Metrics', () => {
  let adminToken: string;
  let partnerBusinessInfoId: string;
  let adminUserId: string;

  // Operadores
  let operator1Id: string;
  let operator2Id: string;

  beforeAll(async () => {
    partnerBusinessInfoId = uuidV4();
    adminUserId = uuidV4();
    operator1Id = uuidV4();
    operator2Id = uuidV4();

    const addressId = uuidV4();
    await prismaClient.address.create({
      data: {
        uuid: addressId,
        postal_code: '00000000',
        line1: 'Rua Teste',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'SP',
        country: 'BR'
      }
    });

    // Criar Parceiro
    await prismaClient.businessInfo.create({
      data: {
        uuid: partnerBusinessInfoId,
        fantasy_name: 'Parceiro Dashboard E2E',
        document: `dash-${Date.now()}`,
        business_type: 'comercio',
        status: 'active',
        email: `dash-${Date.now()}@test.com`,
        classification: 'Comércio',
        colaborators_number: 1,
        address_uuid: addressId,
        phone_1: '11999999999',
        created_at: newDateF(new Date()),
      }
    });

    // Criar Admin
    await prismaClient.businessUser.create({
      data: {
        uuid: adminUserId,
        business_info_uuid: partnerBusinessInfoId,
        name: 'Admin Dashboard',
        user_name: 'admin_dash',
        document: `doc-${Date.now()}`,
        email: `admin_dash${Date.now()}@test.com`,
        password: 'hash',
        is_admin: true,
        status: 'active',
        created_at: newDateF(new Date())
      }
    });

    // Criar Operador 1
    await prismaClient.businessUser.create({
      data: {
        uuid: operator1Id,
        business_info_uuid: partnerBusinessInfoId,
        name: 'Vendedor Joao',
        user_name: 'joao',
        document: `doc-j-${Date.now()}`,
        email: `joao${Date.now()}@test.com`,
        password: 'hash',
        is_admin: false,
        status: 'active',
        created_at: newDateF(new Date())
      }
    });

    // Criar Operador 2
    await prismaClient.businessUser.create({
      data: {
        uuid: operator2Id,
        business_info_uuid: partnerBusinessInfoId,
        name: 'Vendedora Maria',
        user_name: 'maria',
        document: `doc-m-${Date.now()}`,
        email: `maria${Date.now()}@test.com`,
        password: 'hash',
        is_admin: false,
        status: 'active',
        created_at: newDateF(new Date())
      }
    });

    // Gerar Token JWT do Admin
    const companyAdminJWT = new CompanyAdminJWToken();
    adminToken = companyAdminJWT.create({
      uuid: { uuid: adminUserId },
      business_info_uuid: { uuid: partnerBusinessInfoId }
    } as any);

    const now = new Date();

    // =========== CRIAR TRANSAÇÕES ===========

    // Helper function
    const createTx = async (
      status: string,
      netPrice: number,
      feeAmount: number,
      operatorId: string,
      date: Date,
      payerType: 'UserItem' | 'PayerBusiness'
    ) => {
      const txId = uuidV4();

      let userItemUuid = null;
      let payerBusinessInfoUuid = null;

      if (payerType === 'UserItem') {
        const userId = uuidV4();
        await prismaClient.userInfo.create({
          data: {
            uuid: userId,
            full_name: 'Cliente Final App',
            document: `cpf-${Date.now()}-${Math.random()}`,
            email: `cliente${Date.now()}${Math.random()}@test.com`,
            status: 'active',
            date_of_birth: '1990-01-01'
          }
        });
        const fakeItemId = uuidV4();
        await prismaClient.item.create({
          data: {
            uuid: fakeItemId,
            name: 'VR',
            description: 'Vale Refeição',
            item_type: 'produto',
            item_category: 'pre_pago',
            created_at: newDateF(new Date())
          }
        });

        userItemUuid = uuidV4();
        await prismaClient.userItem.create({
          data: {
            uuid: userItemUuid,
            user_info_uuid: userId,
            item_uuid: fakeItemId,
            item_name: 'Benefício VR',
            balance: 5000,
            status: 'active'
          }
        });
      } else {
        payerBusinessInfoUuid = uuidV4();
        await prismaClient.businessInfo.create({
          data: {
            uuid: payerBusinessInfoUuid,
            fantasy_name: 'Empresa Compradora B2B',
            document: `cnpj-${Date.now()}-${Math.random()}`,
            business_type: 'comercio',
            status: 'active',
            email: `b2b${Date.now()}${Math.random()}@test.com`,
            classification: 'Comércio',
            colaborators_number: 1,
            address_uuid: addressId,
            phone_1: '11999999999',
            created_at: newDateF(new Date()),
          }
        });
      }

      await prismaClient.transactions.create({
        data: {
          uuid: txId,
          favored_business_info_uuid: partnerBusinessInfoId,
          transaction_type: 'POS_PAYMENT',
          status: status as TransactionStatus,
          original_price: netPrice,
          net_price: netPrice, // Faturamento Bruto (Ex: 1500)
          partner_credit_amount: netPrice - feeAmount, // Faturamento Liquido (Ex: 1400)
          fee_percentage: 0,
          fee_amount: feeAmount, // Taxa Plataforma (Ex: 100)
          platform_net_fee_amount: feeAmount,
          discount_percentage: 0,
          cashback: 0,
          description: 'E2E test tx',
          created_at: newDateF(date),
          favored_partner_user_uuid: operatorId,
          user_item_uuid: userItemUuid,
          payer_business_info_uuid: payerBusinessInfoUuid
        }
      });
      return txId;
    };

    // 1. Transações de HOJE
    // João (B2C)
    await createTx('success', 1500, 100, operator1Id, now, 'UserItem');
    // Maria (B2B)
    await createTx('success', 2000, 200, operator2Id, now, 'PayerBusiness');
    // Maria (Falha, nao deve somar)
    await createTx('cancelled', 5000, 500, operator2Id, now, 'UserItem');

    // 2. Transações de ONTEM
    // João (B2C)
    await createTx('success', 1000, 50, operator1Id, subDays(now, 1), 'UserItem');

    // 3. Transações do MÊS PASSADO (Para testar o growth)
    // Maria (B2B)
    await createTx('success', 2000, 200, operator2Id, subMonths(now, 1), 'PayerBusiness');
  });

  it('[200 OK] - Should return dashboard metrics with correct Gross vs Net revenue and operator rankings', async () => {
    const response = await request(app)
      .get('/partner/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const kpis = response.body.kpis;

    // =========== VALIDAÇÕES EXAUSTIVAS DE HOJE ===========
    // Bruto: 1500 + 2000 = 3500 centavos -> 35 Reais
    // Líquido: (1500-100) + (2000-200) = 1400 + 1800 = 3200 centavos -> 32 Reais
    expect(kpis.today.totalRevenue).toBe(35);
    expect(kpis.today.netRevenue).toBe(32);
    expect(kpis.today.transactionCount).toBe(2);

    // =========== VALIDAÇÕES DESTE MÊS ===========
    // Bruto: 3500 (Hoje) + 1000 (Ontem) = 4500 -> 45 Reais
    // Líquido: 3200 (Hoje) + 950 (Ontem) = 4150 -> 41.50 Reais
    expect(kpis.currentMonth.totalRevenue).toBe(45);
    expect(kpis.currentMonth.netRevenue).toBe(41.5);
    expect(kpis.currentMonth.transactionCount).toBe(3);

    // Ticket Médio: 45 / 3 = 15 Reais
    expect(kpis.currentMonth.averageTicket).toBe(15);

    // =========== VALIDAÇÕES DE CRESCIMENTO (GROWTH) ===========
    // Mês passado tivemos apenas 1 transação de 20 Reais
    // Crescimento Receita: de 20 para 45 -> aumento de 25 -> (25/20)*100 = 125%
    expect(kpis.growth.revenuePercentage).toBe(125);
    // Crescimento Transações: de 1 para 3 -> aumento de 2 -> (2/1)*100 = 200%
    expect(kpis.growth.transactionsPercentage).toBe(200);

    // =========== VALIDAÇÕES DE RANKING ===========
    const ranking = response.body.operatorRanking;
    expect(ranking.length).toBeGreaterThanOrEqual(2);

    const joaoRank = ranking.find((r: any) => r.name === 'Vendedor Joao');
    // Joao fez 15 hoje e 10 ontem = 25 Reais (Sempre pelo Bruto)
    expect(joaoRank.amount).toBe(25);
    expect(joaoRank.count).toBe(2);

    const mariaRank = ranking.find((r: any) => r.name === 'Vendedora Maria');
    // Maria fez 20 hoje (Success). Cancelled de 50 não entra.
    expect(mariaRank.amount).toBe(20);
    expect(mariaRank.count).toBe(1);

    // =========== VALIDAÇÕES DE LISTAGEM (O Bug do Cliente Avulso) ===========
    const recent = response.body.recentTransactions;

    // A transação mais recente é a última de hoje (Maria B2B)
    // O payerName deve ser "Empresa Compradora B2B" (e não Cliente Avulso)
    const mariaTx = recent.find((r: any) => r.operatorName === 'Vendedora Maria' && r.amount === 20 && r.status === 'success');
    expect(mariaTx.payerName).toBe('Empresa Compradora B2B');

    // A primeira de hoje (João B2C)
    const joaoTx = recent.find((r: any) => r.operatorName === 'Vendedor Joao' && r.amount === 15 && r.status === 'success');
    expect(joaoTx.payerName).toBe('Cliente Final App');
  });
});
