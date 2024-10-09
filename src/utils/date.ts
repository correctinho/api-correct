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
