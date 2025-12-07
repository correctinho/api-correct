import axios, { AxiosInstance } from 'axios';
import { INotifierPayload, INotifierProvider } from '../INotifierProvider';

export class N8nNotifierProvider implements INotifierProvider {
  private axiosClient: AxiosInstance;
  // URL do seu workflow principal no n8n que roteia os eventos
  private readonly n8nUrl = process.env.N8N_MAIN_WEBHOOK_URL || 'SUA_URL_AQUI';

  constructor() {
    // Configuramos uma instância do axios com timeout
    this.axiosClient = axios.create({
      timeout: 5000, // 5 segundos para não travar a aplicação
    });
  }

  async notify(payload: INotifierPayload): Promise<void> {
    console.log("Chamou o notifier N8n com payload:", payload);
    // Usamos o padrão "fire and forget" dentro do método para garantir que erros
    // de rede não propaguem para quem chamou (o UseCase).
    this.axiosClient.post(this.n8nUrl, payload)
      .then(() => {
        // Sucesso (opcional: usar seu logger aqui)
        console.log(`[N8n] Evento ${payload.event_type} enviado com sucesso.`);
      })
      .catch((error) => {
        // Falha silenciosa no fluxo principal, mas logada.
        console.error(`[N8n] ERRO ao enviar evento ${payload.event_type}:`, error.message);
        // Aqui você poderia salvar numa fila de retry (Redis/Bull) no futuro.
      });
  }
}