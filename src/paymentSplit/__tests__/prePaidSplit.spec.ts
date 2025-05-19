import {
  calculateSplitPrePaidAmount,
  CalculateSplitPrePaidInput,
  CalculateSplitPrePaidOutput
} from '../prePaidSplit'; // Ajuste o caminho se necessário

// Assume-se que calculateSplitPrePaidAmount agora retorna Promise<CalculateSplitPrePaidOutput>
// Ex: export async function calculateSplitPrePaidAmount(...): Promise<CalculateSplitPrePaidOutput> { ... }

describe('calculateSplitPrePaidAmount (Async Net Values)', () => {

  // Teste 1: Cálculo básico sem cashback do parceiro
  test('should calculate NET split correctly with standard taxes and no partner cashback (async)', async () => {
    const input: CalculateSplitPrePaidInput = {
      totalAmount: 100.00,
      admin_tax: 100,      // 1.00%
      marketing_tax: 50,   // 0.50%
      marketplace_tax: 150,// 1.50%
      partner_cashback_tax: 0 // 0.00%
    };

    const expectedOutput: Partial<CalculateSplitPrePaidOutput> = {
      platformNetAmount: 2.40,
      userCashbackAmount: 0.60,
      partnerNetAmount: 97.00,
      totalPlatformGrossTaxRate: 0.03,
      totalDebitedFromUser: 100.00,
      platformGrossAmount: 3.00,
      platformCashbackContribution: 0.60,
      partnerCashbackContribution: 0.00,
    };

    // Usa await para chamar a função assíncrona
    const result = await calculateSplitPrePaidAmount(input);

    expect(result.platformNetAmount).toBeCloseTo(expectedOutput.platformNetAmount!);
    expect(result.userCashbackAmount).toBeCloseTo(expectedOutput.userCashbackAmount!);
    expect(result.partnerNetAmount).toBeCloseTo(expectedOutput.partnerNetAmount!);
    expect(result.totalPlatformGrossTaxRate).toBeCloseTo(expectedOutput.totalPlatformGrossTaxRate!);
    expect(result.totalDebitedFromUser).toBeCloseTo(expectedOutput.totalDebitedFromUser!);
    expect(result.platformGrossAmount).toBeCloseTo(expectedOutput.platformGrossAmount!);
    expect(result.platformCashbackContribution).toBeCloseTo(expectedOutput.platformCashbackContribution!);
    expect(result.partnerCashbackContribution).toBeCloseTo(expectedOutput.partnerCashbackContribution!);
    expect(result.partnerNetAmount + result.platformNetAmount + result.userCashbackAmount).toBeCloseTo(input.totalAmount);
  });

  // Teste 2: Cálculo com cashback do parceiro
  test('should calculate NET split correctly including partner cashback (async)', async () => {
    const input: CalculateSplitPrePaidInput = {
      totalAmount: 50.00,
      admin_tax: 80,      // 0.80%
      marketing_tax: 20,   // 0.20%
      marketplace_tax: 100,// 1.00%
      partner_cashback_tax: 50 // 0.50%
    };

    const expectedOutput: Partial<CalculateSplitPrePaidOutput> = {
      platformNetAmount: 0.80,
      userCashbackAmount: 0.45,
      partnerNetAmount: 48.75,
      totalPlatformGrossTaxRate: 0.02,
      totalDebitedFromUser: 50.00,
      platformGrossAmount: 1.00,
      platformCashbackContribution: 0.20,
      partnerCashbackContribution: 0.25,
    };

    // Usa await
    const result = await calculateSplitPrePaidAmount(input);

    expect(result.platformNetAmount).toBeCloseTo(expectedOutput.platformNetAmount!);
    expect(result.userCashbackAmount).toBeCloseTo(expectedOutput.userCashbackAmount!);
    expect(result.partnerNetAmount).toBeCloseTo(expectedOutput.partnerNetAmount!);
    expect(result.totalPlatformGrossTaxRate).toBeCloseTo(expectedOutput.totalPlatformGrossTaxRate!);
    expect(result.totalDebitedFromUser).toBeCloseTo(expectedOutput.totalDebitedFromUser!);
    expect(result.platformGrossAmount).toBeCloseTo(expectedOutput.platformGrossAmount!);
    expect(result.platformCashbackContribution).toBeCloseTo(expectedOutput.platformCashbackContribution!);
    expect(result.partnerCashbackContribution).toBeCloseTo(expectedOutput.partnerCashbackContribution!);
    expect(result.partnerNetAmount + result.platformNetAmount + result.userCashbackAmount).toBeCloseTo(input.totalAmount);
  });

  // Teste 3: Cálculo com todas as taxas zero
  test('should handle zero taxes correctly (Net async)', async () => {
    const input: CalculateSplitPrePaidInput = {
      totalAmount: 200.00,
      admin_tax: 0,
      marketing_tax: 0,
      marketplace_tax: 0,
      partner_cashback_tax: 0
    };

    const expectedOutput: Partial<CalculateSplitPrePaidOutput> = {
      platformNetAmount: 0.00,
      userCashbackAmount: 0.00,
      partnerNetAmount: 200.00,
      totalPlatformGrossTaxRate: 0.00,
      totalDebitedFromUser: 200.00,
      platformGrossAmount: 0.00,
      platformCashbackContribution: 0.00,
      partnerCashbackContribution: 0.00,
    };

    // Usa await
    const result = await calculateSplitPrePaidAmount(input);

    expect(result.platformNetAmount).toBeCloseTo(expectedOutput.platformNetAmount!);
    expect(result.userCashbackAmount).toBeCloseTo(expectedOutput.userCashbackAmount!);
    expect(result.partnerNetAmount).toBeCloseTo(expectedOutput.partnerNetAmount!);
    expect(result.totalPlatformGrossTaxRate).toBeCloseTo(expectedOutput.totalPlatformGrossTaxRate!);
    expect(result.totalDebitedFromUser).toBeCloseTo(expectedOutput.totalDebitedFromUser!);
    expect(result.platformGrossAmount).toBeCloseTo(expectedOutput.platformGrossAmount!);
    expect(result.platformCashbackContribution).toBeCloseTo(expectedOutput.platformCashbackContribution!);
    expect(result.partnerCashbackContribution).toBeCloseTo(expectedOutput.partnerCashbackContribution!);
    expect(result.partnerNetAmount + result.platformNetAmount + result.userCashbackAmount).toBeCloseTo(input.totalAmount);
  });

   // Teste 4: Cálculo com apenas cashback do parceiro (sem taxas da plataforma)
   test('should handle only partner cashback correctly (Net async)', async () => {
    const input: CalculateSplitPrePaidInput = {
      totalAmount: 150.00,
      admin_tax: 0,
      marketing_tax: 0,
      marketplace_tax: 0,
      partner_cashback_tax: 100 // 1.00%
    };

    const expectedOutput: Partial<CalculateSplitPrePaidOutput> = {
      platformNetAmount: 0.00,
      userCashbackAmount: 1.50,
      partnerNetAmount: 148.50,
      totalPlatformGrossTaxRate: 0.00,
      totalDebitedFromUser: 150.00,
      platformGrossAmount: 0.00,
      platformCashbackContribution: 0.00,
      partnerCashbackContribution: 1.50,
    };

    // Usa await
    const result = await calculateSplitPrePaidAmount(input);

    expect(result.platformNetAmount).toBeCloseTo(expectedOutput.platformNetAmount!);
    expect(result.userCashbackAmount).toBeCloseTo(expectedOutput.userCashbackAmount!);
    expect(result.partnerNetAmount).toBeCloseTo(expectedOutput.partnerNetAmount!);
    expect(result.totalPlatformGrossTaxRate).toBeCloseTo(expectedOutput.totalPlatformGrossTaxRate!);
    expect(result.totalDebitedFromUser).toBeCloseTo(expectedOutput.totalDebitedFromUser!);
    expect(result.platformGrossAmount).toBeCloseTo(expectedOutput.platformGrossAmount!);
    expect(result.platformCashbackContribution).toBeCloseTo(expectedOutput.platformCashbackContribution!);
    expect(result.partnerCashbackContribution).toBeCloseTo(expectedOutput.partnerCashbackContribution!);
    expect(result.partnerNetAmount + result.platformNetAmount + result.userCashbackAmount).toBeCloseTo(input.totalAmount);
  });

  // Teste 5: Valor total pequeno para verificar arredondamento
  test('should handle small total amount and rounding correctly (Net async)', async () => {
    const input: CalculateSplitPrePaidInput = {
      totalAmount: 0.50, // R$ 0,50
      admin_tax: 100,    // 1.00%
      marketing_tax: 50, // 0.50%
      marketplace_tax: 0,
      partner_cashback_tax: 20 // 0.20%
    };

    const expectedOutput: Partial<CalculateSplitPrePaidOutput> = {
      platformNetAmount: 0.01,
      userCashbackAmount: 0.00,
      partnerNetAmount: 0.49,
      totalPlatformGrossTaxRate: 0.015,
      totalDebitedFromUser: 0.50,
      platformGrossAmount: 0.01,
      platformCashbackContribution: 0.00,
      partnerCashbackContribution: 0.00,
    };

    // Usa await
    const result = await calculateSplitPrePaidAmount(input);

    expect(result.platformNetAmount).toBeCloseTo(expectedOutput.platformNetAmount!);
    expect(result.userCashbackAmount).toBeCloseTo(expectedOutput.userCashbackAmount!);
    expect(result.partnerNetAmount).toBeCloseTo(expectedOutput.partnerNetAmount!);
    expect(result.totalPlatformGrossTaxRate).toBeCloseTo(expectedOutput.totalPlatformGrossTaxRate!);
    expect(result.totalDebitedFromUser).toBeCloseTo(expectedOutput.totalDebitedFromUser!);
    expect(result.platformGrossAmount).toBeCloseTo(expectedOutput.platformGrossAmount!);
    expect(result.platformCashbackContribution).toBeCloseTo(expectedOutput.platformCashbackContribution!);
    expect(result.partnerCashbackContribution).toBeCloseTo(expectedOutput.partnerCashbackContribution!);
    expect(result.partnerNetAmount + result.platformNetAmount + result.userCashbackAmount).toBeCloseTo(input.totalAmount);
  });


  // Testes de validação de input (usando rejects para Promises)
  test('should reject for zero total amount (async)', async () => {
    const input: CalculateSplitPrePaidInput = { totalAmount: 0, admin_tax: 100, marketing_tax: 50, marketplace_tax: 150, partner_cashback_tax: 0 };
    // Verifica se a Promise é rejeitada com o erro esperado
    await expect(calculateSplitPrePaidAmount(input)).rejects.toThrow("O valor total da transação deve ser positivo.");
  });

  test('should reject for negative total amount (async)', async () => {
    const input: CalculateSplitPrePaidInput = { totalAmount: -100, admin_tax: 100, marketing_tax: 50, marketplace_tax: 150, partner_cashback_tax: 0 };
    await expect(calculateSplitPrePaidAmount(input)).rejects.toThrow("O valor total da transação deve ser positivo.");
  });

  test('should reject for negative tax (async)', async () => {
    const input: CalculateSplitPrePaidInput = { totalAmount: 100, admin_tax: -100, marketing_tax: 50, marketplace_tax: 150, partner_cashback_tax: 0 };
    await expect(calculateSplitPrePaidAmount(input)).rejects.toThrow("As taxas não podem ser negativas.");
  });

   test('should reject for negative partner cashback tax (async)', async () => {
    const input: CalculateSplitPrePaidInput = { totalAmount: 100, admin_tax: 100, marketing_tax: 50, marketplace_tax: 150, partner_cashback_tax: -10 };
    await expect(calculateSplitPrePaidAmount(input)).rejects.toThrow("As taxas não podem ser negativas.");
  });

});
