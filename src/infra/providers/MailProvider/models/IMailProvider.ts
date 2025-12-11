export interface ISendMailDTO {
  to: string; // E-mail do destinatário
  subject: string; // Assunto
  body: string; // Corpo do e-mail (pode ser HTML string)
  from?: {
    // Opcional: permite sobrescrever o remetente padrão
    name: string;
    address: string;
  };
}

export interface IMailProvider {
  sendMail(data: ISendMailDTO): Promise<void>;
}