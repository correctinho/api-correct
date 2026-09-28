import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { prismaClient } from '../../../../infra/databases/prisma.config';
import { newDateF } from '../../../../utils/date';
import { CompanyAdminJWToken } from '../../../../infra/shared/crypto/token/CompanyAdmin/jwt.token';
import { app } from '../../../../app';
import { TransactionStatus } from '@prisma/client';

describe('E2E - Process Payment By Partner', () => {
  let sellerToken: string;
  let buyerWithBalanceToken: string;
  let buyerWithoutBalanceToken: string;

  let sellerBusinessInfoId: string;
  let buyerWithBalanceInfoId: string;
  let buyerWithoutBalanceInfoId: string;

  let sellerAccountId: string;
  let buyerWithBalanceAccountId: string;
  let buyerWithoutBalanceAccountId: string;

  let correctAccountId: string;

  beforeAll(async () => {
    sellerBusinessInfoId = uuidV4();
    buyerWithBalanceInfoId = uuidV4();
    buyerWithoutBalanceInfoId = uuidV4();

    sellerAccountId = uuidV4();
    buyerWithBalanceAccountId = uuidV4();
    buyerWithoutBalanceAccountId = uuidV4();

    const sellerUserId = uuidV4();
    const buyerWithBalanceUserId = uuidV4();
    const buyerWithoutBalanceUserId = uuidV4();

    const addressId = uuidV4();
    await prismaClient.address.create({
      data: {
        uuid: addressId,
        postal_code: '00000000'
      }
    });

    // 0. Garantir que CorrectAccount existe
    let correctAccount = await prismaClient.correctAccount.findFirst();
    if (!correctAccount) {
      correctAccountId = uuidV4();
      await prismaClient.correctAccount.create({
        data: {
          uuid: correctAccountId,
          balance: 0,
          status: 'active',
          created_at: newDateF(new Date())
        }
      });
    } else {
      correctAccountId = correctAccount.uuid;
    }

    // 1. Criar Parceiro Vendedor (Recebedor)
    await prismaClient.businessInfo.create({
      data: {
        uuid: sellerBusinessInfoId,
        fantasy_name: 'Parceiro Vendedor Teste',
        document: `vend-${Date.now()}`,
        business_type: 'comercio',
        status: 'active',
        email: `vend-${Date.now()}@test.com`,
        classification: 'Comércio',
        colaborators_number: 1,
        address_uuid: addressId,
        phone_1: '11999999999',
        created_at: newDateF(new Date()),
        BusinessUser: {
          create: {
            uuid: sellerUserId,
            name: 'Admin Vendedor',
            user_name: 'admin_vend',
            document: `vend-${Date.now()}`,
            email: `admin_vend${Date.now()}@test.com`,
            password: 'hash',
            is_admin: true,
            status: 'active',
            created_at: newDateF(new Date())
          }
        },
        BusinessAccount: {
          create: {
            uuid: sellerAccountId,
            balance: 0,
            status: "active",
            created_at: newDateF(new Date())
          }
        }
      }
    });

    await prismaClient.partnerConfig.create({
      data: {
        uuid: uuidV4(),
        business_info_uuid: sellerBusinessInfoId,
        items_uuid: [],
        cashback_tax: 0,
        admin_tax: 0,
        marketing_tax: 0,
        use_marketing: false,
        use_market_place: false,
        main_branch: uuidV4(),
        partner_category: ["Comércio"],
        created_at: newDateF(new Date())
      }
    });

    // 2. Criar Parceiro Comprador (Com Saldo)
    await prismaClient.businessInfo.create({
      data: {
        uuid: buyerWithBalanceInfoId,
        fantasy_name: 'Comprador Com Saldo',
        document: `comp1-${Date.now()}`,
        business_type: 'comercio',
        status: 'active',
        email: `comp1-${Date.now()}@test.com`,
        classification: 'Comércio',
        colaborators_number: 1,
        address_uuid: addressId,
        phone_1: '11999999999',
        created_at: newDateF(new Date()),
        BusinessUser: {
          create: {
            uuid: buyerWithBalanceUserId,
            name: 'Admin Comprador 1',
            user_name: 'admin_comp1',
            document: `comp1-${Date.now()}`,
            email: `admin_comp1${Date.now()}@test.com`,
            password: 'hash',
            is_admin: true,
            status: 'active',
            created_at: newDateF(new Date())
          }
        },
        BusinessAccount: {
          create: {
            uuid: buyerWithBalanceAccountId,
            balance: 50000, // 500 reais
            status: "active",
            created_at: newDateF(new Date())
          }
        }
      }
    });

    // 3. Criar Parceiro Comprador (Sem Saldo)
    await prismaClient.businessInfo.create({
      data: {
        uuid: buyerWithoutBalanceInfoId,
        fantasy_name: 'Comprador Sem Saldo',
        document: `comp2-${Date.now()}`,
        business_type: 'comercio',
        status: 'active',
        email: `comp2-${Date.now()}@test.com`,
        classification: 'Comércio',
        colaborators_number: 1,
        address_uuid: addressId,
        phone_1: '11999999999',
        created_at: newDateF(new Date()),
        BusinessUser: {
          create: {
            uuid: buyerWithoutBalanceUserId,
            name: 'Admin Comprador 2',
            user_name: 'admin_comp2',
            document: `comp2-${Date.now()}`,
            email: `admin_comp2${Date.now()}@test.com`,
            password: 'hash',
            is_admin: true,
            status: 'active',
            created_at: newDateF(new Date())
          }
        },
        BusinessAccount: {
          create: {
            uuid: buyerWithoutBalanceAccountId,
            balance: 0, // Sem Saldo
            status: "active",
            created_at: newDateF(new Date())
          }
        }
      }
    });

    // 4. Gerar Tokens JWT
    const companyAdminJWT = new CompanyAdminJWToken();
    sellerToken = companyAdminJWT.create({
      uuid: { uuid: sellerUserId },
      business_info_uuid: { uuid: sellerBusinessInfoId }
    } as any);

    buyerWithBalanceToken = companyAdminJWT.create({
      uuid: { uuid: buyerWithBalanceUserId },
      business_info_uuid: { uuid: buyerWithBalanceInfoId }
    } as any);

    buyerWithoutBalanceToken = companyAdminJWT.create({
      uuid: { uuid: buyerWithoutBalanceUserId },
      business_info_uuid: { uuid: buyerWithoutBalanceInfoId }
    } as any);
  });

  // Factory Helper
  const createMockTransaction = async (status: string, net_price: number, fee: number) => {
    const transactionId = uuidV4();
    await prismaClient.transactions.create({
      data: {
        uuid: transactionId,
        favored_business_info_uuid: sellerBusinessInfoId,
        transaction_type: 'POS_PAYMENT',
        status: status as TransactionStatus,
        original_price: net_price,
        net_price: net_price,
        partner_credit_amount: net_price - fee,
        fee_percentage: 0,
        fee_amount: fee,
        platform_net_fee_amount: fee,
        discount_percentage: 0,
        cashback: 0,
        description: 'E2E test transaction',
        created_at: newDateF(new Date()),
      }
    });
    return transactionId;
  };

  it('[400 Bad Request] - Should fail if transactionId is missing', async () => {
    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithBalanceToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Dados da transação ou do pagador estão ausentes.");
  });

  it('[404 Not Found] - Should fail if transaction does not exist', async () => {
    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithBalanceToken}`)
      .send({ transactionId: uuidV4() });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Transação não encontrada.");
  });

  it('[400 Bad Request] - Should fail if transaction is already cancelled', async () => {
    const txId = await createMockTransaction('cancelled', 1500, 0);
    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithBalanceToken}`)
      .send({ transactionId: txId });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Esta cobrança foi cancelada pelo estabelecimento e não pode mais ser paga.");
  });

  it('[400 Bad Request] - Should fail if transaction is already success', async () => {
    const txId = await createMockTransaction('success', 1500, 0);
    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithBalanceToken}`)
      .send({ transactionId: txId });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Esta cobrança já foi paga anteriormente.");
  });

  it('[402 Payment Required] - Should fail if buyer has insufficient balance', async () => {
    const txId = await createMockTransaction('pending', 1500, 0); // 15 Reais
    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithoutBalanceToken}`)
      .send({ transactionId: txId });

    expect(response.status).toBe(402);
    expect(response.body.error).toBe("Saldo total (líquido + créditos) insuficiente para esta compra.");
  });

  it('[200 OK] - Should process payment successfully and distribute funds', async () => {
    const net_price = 1500; // 15.00
    const fee_amount = 150; // 1.50 (10% fee)
    const txId = await createMockTransaction('pending', net_price, fee_amount);

    // Pegar o saldo antes
    const buyerAccBefore = await prismaClient.businessAccount.findUnique({ where: { uuid: buyerWithBalanceAccountId } });
    const sellerAccBefore = await prismaClient.businessAccount.findUnique({ where: { uuid: sellerAccountId } });
    const correctAccBefore = await prismaClient.correctAccount.findUnique({ where: { uuid: correctAccountId } });

    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithBalanceToken}`)
      .send({ transactionId: txId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.netAmountPaid).toBe(15);

    // ======== VALIDAÇÕES DE BANCO DE DADOS ========

    // 1. Transactions
    const txDb = await prismaClient.transactions.findUnique({ where: { uuid: txId } });
    expect(txDb?.status).toBe('success');
    expect(txDb?.payer_business_info_uuid).toBe(buyerWithBalanceInfoId);
    expect(txDb?.paid_at).not.toBeNull();

    // 2. BusinessAccount (Comprador)
    const buyerAccAfter = await prismaClient.businessAccount.findUnique({ where: { uuid: buyerWithBalanceAccountId } });
    expect(buyerAccAfter?.balance).toBe(buyerAccBefore!.balance - net_price);

    // 3. BusinessAccount (Vendedor)
    const sellerAccAfter = await prismaClient.businessAccount.findUnique({ where: { uuid: sellerAccountId } });
    const partner_credit_amount = net_price - fee_amount;
    expect(sellerAccAfter?.balance).toBe(sellerAccBefore!.balance + partner_credit_amount);

    // 4. CorrectAccount (Plataforma)
    const correctAccAfter = await prismaClient.correctAccount.findUnique({ where: { uuid: correctAccountId } });
    expect(correctAccAfter?.balance).toBe(correctAccBefore!.balance + fee_amount);

    // 5. Histórico do Comprador
    const buyerHistory = await prismaClient.businessAccountHistory.findFirst({
      where: { related_transaction_uuid: txId, business_account_uuid: buyerWithBalanceAccountId }
    });
    expect(buyerHistory).toBeDefined();
    expect(buyerHistory?.event_type).toBe('PAYOUT_PROCESSED');
    expect(buyerHistory?.amount).toBe(-net_price);

    // 6. Histórico do Vendedor
    const sellerHistory = await prismaClient.businessAccountHistory.findFirst({
      where: { related_transaction_uuid: txId, business_account_uuid: sellerAccountId }
    });
    expect(sellerHistory).toBeDefined();
    expect(sellerHistory?.event_type).toBe('PAYMENT_RECEIVED');
    expect(sellerHistory?.amount).toBe(partner_credit_amount);

    // 7. Histórico da Correct
    const correctHistory = await prismaClient.correctAccountHistory.findFirst({
      where: { related_transaction_uuid: txId, correct_account_uuid: correctAccountId }
    });
    expect(correctHistory).toBeDefined();
    expect(correctHistory?.event_type).toBe('PLATFORM_FEE_COLLECTED');
    expect(correctHistory?.amount).toBe(fee_amount);
  });

  it('[400 Bad Request] - Should fail if buyer tries to pay the EXACT SAME successful transaction again (Double Spend)', async () => {
    // Nós acabamos de pagar a txId no teste anterior
    // Vamos buscar no banco a que acabou de ficar success
    const txDb = await prismaClient.transactions.findFirst({ where: { status: 'success' } });
    const response = await request(app)
      .post('/pos-transaction/business/processing')
      .set('Authorization', `Bearer ${buyerWithBalanceToken}`)
      .send({ transactionId: txDb!.uuid });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Esta cobrança já foi paga anteriormente.");
  });
});
