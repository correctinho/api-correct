import 'dotenv/config'; // Garante que as variáveis de ambiente sejam carregadas
import { CustomError } from '../errors/custom.error';

// 1. Lemos as variáveis do ambiente. Elas sempre vêm como string.
const settlementDayStr = process.env.SETTLEMENT_DAY_OF_MONTH;
const delayMonthsStr = process.env.SETTLEMENT_DELAY_MONTHS;

// 2. Validamos e convertemos para número.
const settlementDay = parseInt(settlementDayStr || '', 10);
const delayMonths = parseInt(delayMonthsStr || '', 10);

// 3. Verificamos se são válidas. Se não, o sistema deve falhar ao iniciar.
// Isso previne erros inesperados em produção por falta de configuração.
if (isNaN(settlementDay) || settlementDay < 1 || settlementDay > 28) {
  throw new CustomError('Variável de ambiente SETTLEMENT_DAY_OF_MONTH é inválida ou não foi definida. Use um valor entre 1 e 28.', 400);
}

if (isNaN(delayMonths) || delayMonths < 0) {
  throw new CustomError('Variável de ambiente SETTLEMENT_DELAY_MONTHS é inválida ou não foi definida.', 400);
}

// 4. Exportamos a configuração já validada e tipada.
export const settlementConfig = {
  dayOfMonth: settlementDay,
  delayInMonths: delayMonths,
};