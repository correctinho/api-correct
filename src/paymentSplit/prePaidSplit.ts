/**
 * src/paymentSplit/prePaidSplit.ts
 *
 * Este arquivo contém funções relacionadas ao cálculo de divisão de pagamentos.
 */

/**
 * Interface para os parâmetros de entrada da função calculateSplitPrePaidAmount.
 * As taxas são fornecidas como inteiros representando pontos base (basis points).
 * Exemplo: Uma taxa de 0.98% é representada como 98.
 */
export interface CalculateSplitPrePaidInput {
  /** O valor total da transação pago pelo usuário. */
  totalAmount: number;
  /** Taxa administrativa cobrada do parceiro (em pontos base, ex: 98 para 0.98%). */
  admin_tax: number;
  /** Taxa de marketing cobrada do parceiro (em pontos base). */
  marketing_tax: number;
  /** Taxa de marketplace cobrada do parceiro (em pontos base). */
  marketplace_tax: number;
  /** Taxa de cashback adicional oferecida pelo parceiro ao usuário (em pontos base, pode ser 0). */
  partner_cashback_tax: number;
}

/**
 * Interface para o objeto de saída da função calculateSplitPrePaidAmount.
 * Contém os valores LÍQUIDOS calculados para cada parte envolvida.
 */
export interface CalculateSplitPrePaidOutput {
  /** Valor LÍQUIDO retido pela plataforma (Admin Correct) após contribuir para o cashback. */
  platformNetAmount: number;
  /** Valor total recebido pelo usuário como cashback. */
  userCashbackAmount: number;
  /** Valor LÍQUIDO retido pelo parceiro (após desconto da taxa da plataforma e contribuição para cashback). */
  partnerNetAmount: number;
  /** Taxa total combinada (decimal) bruta que seria cobrada pela plataforma. */
  totalPlatformGrossTaxRate: number;
   /** Taxa total combinada (decimal) de cashback para o usuário. */
  totalUserCashbackRate: number;
  /** Valor total debitado inicialmente da conta do usuário (igual ao totalAmount). */
  totalDebitedFromUser: number;
   /** Valor bruto da taxa da plataforma (antes da contribuição para cashback). */
   platformGrossAmount: number;
   /** Valor do cashback contribuído pela plataforma. */
   platformCashbackContribution: number;
   /** Valor do cashback contribuído diretamente pelo parceiro. */
   partnerCashbackContribution: number;
}

/**
 * Calcula a divisão LÍQUIDA de um pagamento pré-pago entre a plataforma, o usuário (cashback) e o parceiro.
 *
 * @param input - Objeto contendo o valor total e as taxas aplicáveis (em pontos base).
 * @returns Um objeto com os valores líquidos calculados para cada parte.
 */
export async function calculateSplitPrePaidAmount(input: CalculateSplitPrePaidInput): Promise<CalculateSplitPrePaidOutput> {
  const {
    totalAmount,
    admin_tax,
    marketing_tax,
    marketplace_tax,
    partner_cashback_tax,
  } = input;

  // Validação básica de entrada
  if (totalAmount <= 0) {
    throw new Error("O valor total da transação deve ser positivo.");
  }
  if (admin_tax < 0 || marketing_tax < 0 || marketplace_tax < 0 || partner_cashback_tax < 0) {
      throw new Error("As taxas não podem ser negativas.");
  }

  // 1. Calcular a taxa bruta total da plataforma (Admin Correct)
  const totalPlatformGrossTaxRate = (admin_tax + marketing_tax + marketplace_tax) / 10000;
  const platformGrossAmount = totalAmount * totalPlatformGrossTaxRate;

  // 2. Calcular a contribuição da plataforma para o cashback (20% da taxa bruta)
  const platformCashbackContribution = platformGrossAmount * 0.20;

  // 3. Calcular a taxa de cashback direto do parceiro
  const partnerCashbackRate = partner_cashback_tax / 10000;
  const partnerCashbackContribution = totalAmount * partnerCashbackRate;

  // 4. Calcular o cashback total do usuário
  const userCashbackAmount = platformCashbackContribution + partnerCashbackContribution;

  // 5. Calcular o valor LÍQUIDO da plataforma
  // Taxa bruta menos a contribuição da plataforma para o cashback
  const platformNetAmount = platformGrossAmount - platformCashbackContribution;

  // 6. Calcular o valor LÍQUIDO do parceiro
  // Valor total menos a taxa bruta da plataforma menos o cashback direto do parceiro
  const partnerNetAmount = totalAmount - platformGrossAmount - partnerCashbackContribution;

  // Arredondar os valores monetários finais para 2 casas decimais
  const roundedPlatformNetAmount = Math.round(platformNetAmount * 100) / 100;
  const roundedPartnerNetAmount = Math.round(partnerNetAmount * 100) / 100;
  const roundedUserCashbackAmount = Math.round(userCashbackAmount * 100) / 100;
  const roundedPlatformGrossAmount = Math.round(platformGrossAmount * 100) / 100;
  const roundedPlatformCashbackContribution = Math.round(platformCashbackContribution * 100) / 100;
  const roundedPartnerCashbackContribution = Math.round(partnerCashbackContribution * 100) / 100;


  // Verificação de consistência (opcional, mas útil)
  // A soma dos valores líquidos retidos + cashback total deve ser igual ao valor total pago
  if (Math.abs(totalAmount - (roundedPartnerNetAmount + roundedPlatformNetAmount + roundedUserCashbackAmount)) > 0.001) {
      console.warn("Alerta de consistência: totalAmount não corresponde à soma dos valores líquidos e cashback após arredondamento.");
      // Considerar lançar erro ou ajustar arredondamento se a precisão for crítica
  }


  // 7. Retornar os valores calculados (incluindo os líquidos)
  return {
    platformNetAmount: roundedPlatformNetAmount,
    userCashbackAmount: roundedUserCashbackAmount,
    partnerNetAmount: roundedPartnerNetAmount,
    totalPlatformGrossTaxRate: totalPlatformGrossTaxRate,
    totalUserCashbackRate: totalAmount > 0 ? userCashbackAmount / totalAmount : 0, // Taxa efetiva de cashback
    totalDebitedFromUser: totalAmount,
    // Valores adicionais para clareza/auditoria
    platformGrossAmount: roundedPlatformGrossAmount,
    platformCashbackContribution: roundedPlatformCashbackContribution,
    partnerCashbackContribution: roundedPartnerCashbackContribution,
  };
}

// --- Exemplo de Uso (mantido comentado) ---
/*
const exemploInput: CalculateSplitPrePaidInput = {
  totalAmount: 100.00, admin_tax: 100, marketing_tax: 50, marketplace_tax: 150, partner_cashback_tax: 0
};
try {
    const r = calculateSplitPrePaidAmount(exemploInput);
    console.log("Exemplo 1 - Resultado Líquido:");
    console.log(` - Total Pago: R$ ${r.totalDebitedFromUser.toFixed(2)}`);
    console.log(` - Plataforma (Líquido): R$ ${r.platformNetAmount.toFixed(2)} (Taxa Bruta: ${(r.totalPlatformGrossTaxRate * 100).toFixed(2)}%, Bruto: R$ ${r.platformGrossAmount.toFixed(2)}, Contrib. CB: R$ ${r.platformCashbackContribution.toFixed(2)})`);
    console.log(` - Parceiro (Líquido): R$ ${r.partnerNetAmount.toFixed(2)} (Contrib. CB Direto: R$ ${r.partnerCashbackContribution.toFixed(2)})`);
    console.log(` - Usuário (Cashback Total): R$ ${r.userCashbackAmount.toFixed(2)} (Taxa Efetiva: ${(r.totalUserCashbackRate * 100).toFixed(2)}%)`);
    console.log(` - Verificação (P+P+U): R$ ${(r.platformNetAmount + r.partnerNetAmount + r.userCashbackAmount).toFixed(2)}`)
} catch (e) { console.error(e.message); }

const exemploInput2: CalculateSplitPrePaidInput = {
  totalAmount: 50.00, admin_tax: 80, marketing_tax: 20, marketplace_tax: 100, partner_cashback_tax: 50
};
try {
    const r2 = calculateSplitPrePaidAmount(exemploInput2);
    console.log("\nExemplo 2 - Resultado Líquido:");
    console.log(` - Total Pago: R$ ${r2.totalDebitedFromUser.toFixed(2)}`);
    console.log(` - Plataforma (Líquido): R$ ${r2.platformNetAmount.toFixed(2)} (Taxa Bruta: ${(r2.totalPlatformGrossTaxRate * 100).toFixed(2)}%, Bruto: R$ ${r2.platformGrossAmount.toFixed(2)}, Contrib. CB: R$ ${r2.platformCashbackContribution.toFixed(2)})`);
    console.log(` - Parceiro (Líquido): R$ ${r2.partnerNetAmount.toFixed(2)} (Contrib. CB Direto: R$ ${r2.partnerCashbackContribution.toFixed(2)})`);
    console.log(` - Usuário (Cashback Total): R$ ${r2.userCashbackAmount.toFixed(2)} (Taxa Efetiva: ${(r2.totalUserCashbackRate * 100).toFixed(2)}%)`);
     console.log(` - Verificação (P+P+U): R$ ${(r2.platformNetAmount + r2.partnerNetAmount + r2.userCashbackAmount).toFixed(2)}`)
} catch (e) { console.error(e.message); }
*/
