import { IDomainEvent } from "./IDomainEvent";
import { IHandle } from "./IHandler";

export class DomainEvents {
  // Mapa que guarda: NomeDoEvento -> Lista[] de Handlers que querem ouvir
  private static handlersMap = new Map<string, IHandle<any>[]>();

  // Método usado na inicialização do app para registrar quem ouve o quê
  public static register(handler: IHandle<any>, eventClassName: string): void {
    if (!this.handlersMap.has(eventClassName)) {
      this.handlersMap.set(eventClassName, []);
    }
    this.handlersMap.get(eventClassName)?.push(handler);
    console.log(`[DomainEvents] Handler registrado para: ${eventClassName}`);
  }

  // Método chamado pelos UseCases para disparar o evento
  public static async publish(event: IDomainEvent): Promise<void> {
    const eventClassName = event.constructor.name;
    console.log(`[DomainEvents] Publicando evento: ${eventClassName}`);

    const handlers = this.handlersMap.get(eventClassName);
    if (handlers && handlers.length > 0) {
      // Executa todos os handlers que assinaram este evento
      // Usamos Promise.allSettled para que a falha de um handler não quebre os outros
      await Promise.allSettled(
        handlers.map((handler) => handler.handle(event))
      );
    }
  }
   // Útil para testes
  public static clearHandlers(): void {
    this.handlersMap.clear();
  }
}