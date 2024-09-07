import { CustomError } from "../errors/custom.error";

export const newDateF = (date: Date): string => {

    if(!date) throw new CustomError("Date is required", 400)

    if(!(date instanceof Date)) throw new CustomError("Date must be Date instance of", 400)

    const day =
        date.getDate().toString().length === 1
            ? `0${date.getDate()}`
            : `${date.getDate()}`;

    const month =
        `${date.getMonth()}`.length === 1
            ? `0${date.getMonth() + 1}`
            : `${date.getMonth() + 1}`;

    const year = `${date.getFullYear()}`;

    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();

    //return `${day}/${month}/${year}T${h}:${m}:${s}`;
    return `${year}-${month}-${day}T${h}:${m}:${s}`

};

export const calculateHourDifference = async (olderDateString: string, newestDateString: string): Promise<number> => {
  // Função para converter uma string de data para um objeto Date
  const parseDate = (dateString: string): Date => {
      const [datePart, timePart] = dateString.split('T');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
  };

  // Converter as strings de data em objetos de data
  const date1 = parseDate(olderDateString);
  const date2 = parseDate(newestDateString);

  // Calcular a diferença em milissegundos entre as duas datas
  const differenceInMs = date2.getTime() - date1.getTime();

  // Converter a diferença de milissegundos para horas
  const differenceInHours = differenceInMs / (1000 * 60 * 60);

  return differenceInHours;
};

export const addDaysToDate = async (dateString: string, daysToAdd: number): Promise<string> => {
  // Função para converter uma string de data para um objeto Date
  const parseDate = (dateString: string): Date => {
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);

      return new Date(year, month - 1, day, hour, minute, second);
  };

  // Converter a string de data em um objeto de data
  const date = parseDate(dateString);

  // Adicionar os dias especificados à data
  date.setDate(date.getDate() + daysToAdd);

  const day =
      date.getDate().toString().length === 1
          ? `0${date.getDate()}`
          : `${date.getDate()}`;

  const month =
      `${date.getMonth()}`.length === 1
          ? `0${date.getMonth() + 1}`
          : `${date.getMonth() + 1}`;

  const year = `${date.getFullYear()}`;

  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  return `${year}-${month}-${day}T${h}:${m}:${s}`
};
