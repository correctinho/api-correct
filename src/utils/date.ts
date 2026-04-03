import { CustomError } from "../errors/custom.error";

// Função auxiliar para formatar componentes de data com dois dígitos
const formatDateComponent = (component: number): string => {
  return component.toString().padStart(2, '0');
};

// Função para formatar uma data em string no formato desejado
const formatDateToString = (date: Date): string => {
  const day = formatDateComponent(date.getDate());
  const month = formatDateComponent(date.getMonth() + 1);
  const year = `${date.getFullYear()}`;
  const h = formatDateComponent(date.getHours());
  const m = formatDateComponent(date.getMinutes());
  const s = formatDateComponent(date.getSeconds());

  return `${year}-${month}-${day}T${h}:${m}:${s}`;
};

export const newDateF = (date: Date): string => {
  if (!date) throw new CustomError("Date is required", 400);
  if (!(date instanceof Date)) throw new CustomError("Date must be Date instance of", 400);

  return formatDateToString(date);
};

export const calculateHourDifference = async (olderDateString: string, newestDateString: string): Promise<number> => {
  const parseDate = (dateString: string): Date => {
    const [datePart, timePart] = dateString.split('T');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const date1 = parseDate(olderDateString);
  const date2 = parseDate(newestDateString);
  const differenceInMs = date2.getTime() - date1.getTime();
  const differenceInHours = differenceInMs / (1000 * 60 * 60);

  return differenceInHours;
};

export const addDaysToDate = async (dateString: string, daysToAdd: number): Promise<string> => {
  const parseDate = (dateString: string): Date => {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const date = parseDate(dateString);
  date.setDate(date.getDate() + daysToAdd);

  return formatDateToString(date);
};

const settlementConfig = {
  dayOfMonth: 25,      // O dia fixo do pagamento
  delayInMonths: 2,    // <--- MUDE AQUI! (1 = mês seguinte, 2 = daqui dois meses, 0 = mesmo mês)
};

export const calculateB2BCycleSettlementDateAsDate = (transactionDate: Date): Date => {
  const settlementDate = new Date(transactionDate.getTime());

  // 1º PASSO: Fixa o dia PRIMEIRO puxando da configuração
  // (Isso evita que o JS crie datas inexistentes como "31 de Fevereiro")
  settlementDate.setDate(settlementConfig.dayOfMonth);

  // 2º PASSO: Avança os meses com base no que você definiu com seu sócio
  settlementDate.setMonth(settlementDate.getMonth() + settlementConfig.delayInMonths);

  // 3º PASSO: Zera as horas para padronizar no banco de dados
  settlementDate.setHours(0, 0, 0, 0);

  return settlementDate;
};

export const calculatePrePaidCycleSettlementDateAsDate = (transactionDate: Date): Date => {
  const settlementDate = new Date(transactionDate.getTime());
  settlementDate.setMonth(settlementDate.getMonth() + settlementConfig.delayInMonths);
  settlementDate.setDate(settlementConfig.dayOfMonth);
  settlementDate.setHours(0, 0, 0, 0);
  return settlementDate;
};

export const calculatePostPaidCycleSettlementDateAsDate = (
  transactionDate: Date,
  employerCutoffDay: number // Ex: 19 (O dia que fecha o ciclo do empregador)
): Date => {
  const settlementDate = new Date(transactionDate.getTime());

  // O delay base (ex: 1 mês)
  let monthsToAdd = settlementConfig.delayInMonths;

  // A MÁGICA: Se a compra foi feita DEPOIS do dia de corte do empregador, 
  // ela pertence ao próximo ciclo. Logo, empurramos +1 mês para frente!
  if (transactionDate.getDate() > employerCutoffDay) {
    monthsToAdd += 1;
  }

  settlementDate.setMonth(settlementDate.getMonth() + monthsToAdd);
  settlementDate.setDate(settlementConfig.dayOfMonth); // Crava no dia 25
  settlementDate.setHours(0, 0, 0, 0);

  return settlementDate;
};