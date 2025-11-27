import { SubscriptionStatus, BillingPeriod } from '@prisma/client';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { CustomError } from '../../../../errors/custom.error';

// Tipos para as propriedades internas
export type SubscriptionProps = {
    uuid?: Uuid;
    subscription_plan_uuid: Uuid;
    business_info_uuid?: Uuid | null;
    user_info_uuid?: Uuid | null;
    status: SubscriptionStatus;
    start_date?: Date;
    end_date?: Date | null;
    next_billing_date?: Date | null;
    employer_item_details_uuid?: Uuid | null;
    user_item_uuid?: Uuid | null;
    created_at?: Date;
    updated_at?: Date;
};

// Tipo para saída JSON (DTOs)
export type SubscriptionToJSONOutput = {
    uuid: string;
    subscription_plan_uuid: string;
    business_info_uuid: string | null;
    user_info_uuid: string | null;
    status: SubscriptionStatus;
    start_date: Date;
    end_date: Date | null;
    next_billing_date: Date | null;
    employer_item_details_uuid: string | null;
    user_item_uuid: string | null;
    created_at: Date;
    updated_at: Date;
};

export class SubscriptionEntity {
    private _uuid: Uuid;
    private _subscription_plan_uuid: Uuid;
    private _business_info_uuid: Uuid | null;
    private _user_info_uuid: Uuid | null;
    private _status: SubscriptionStatus;
    private _start_date: Date;
    private _end_date: Date | null;
    private _next_billing_date: Date | null;
    private _employer_item_details_uuid: Uuid | null;
    private _user_item_uuid: Uuid | null;
    private _created_at: Date;
    private _updated_at: Date;

    private constructor(props: SubscriptionProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._subscription_plan_uuid = props.subscription_plan_uuid;
        this._business_info_uuid = props.business_info_uuid ?? null;
        this._user_info_uuid = props.user_info_uuid ?? null;
        this._status = props.status;
        this._start_date = props.start_date ?? new Date();
        this._end_date = props.end_date ?? null;
        this._next_billing_date = props.next_billing_date ?? null;
        this._employer_item_details_uuid =
            props.employer_item_details_uuid ?? null;
        this._user_item_uuid = props.user_item_uuid ?? null;
        this._created_at = props.created_at ?? new Date();
        this._updated_at = props.updated_at ?? new Date();
        this.validate();
    }

    // --- Getters ---
    get uuid(): Uuid {
        return this._uuid;
    }
    get subscription_plan_uuid(): Uuid {
        return this._subscription_plan_uuid;
    }
    get user_info_uuid(): Uuid | null {
        return this._user_info_uuid;
    }
    get status(): SubscriptionStatus {
        return this._status;
    }
    get user_item_uuid(): Uuid | null {
        return this._user_item_uuid;
    }
    get end_date(): Date | null {
        return this._end_date;
    }
    get next_billing_date(): Date | null {
        return this._next_billing_date;
    }
    get business_info_uuid(): Uuid | null {
        return this._business_info_uuid;
    }
    get employer_item_details_uuid(): Uuid | null {
        return this._employer_item_details_uuid;
    }
    get start_date(): Date {
        return this._start_date;
    }
    get created_at(): Date {
        return this._created_at;
    }
    get updated_at(): Date {
        return this._updated_at;
    }
    
    

    // Chamado quando o webhook do Pix confirmar o pagamento
    public markAsPaidAndActivate(billingPeriod: BillingPeriod): void {
        const now = new Date();

        // Validação Opcional
        if (this._status !== SubscriptionStatus.PENDING_PAYMENT) {
            console.warn(
                `[SubscriptionEntity] Ativando assinatura ${this._uuid.uuid} que não estava pendente. Status anterior: ${this._status}`
            );
        }

        // 1. Muda o status e data de atualização
        this._status = SubscriptionStatus.ACTIVE;
        this._updated_at = now;

        // 2. Lógica de Datas (O Pulo do Gato)
        // Se a data de início original já passou, resetamos o ciclo para começar AGORA.
        if (!this._start_date || this._start_date < now) {
            console.log(
                `[SubscriptionEntity] Pagamento confirmado tardiamente. Ajustando início do ciclo de ${this._start_date?.toISOString()} para ${now.toISOString()}`
            );

            // O início do serviço é agora.
            this._start_date = now;

            // 3. Recalcula o próximo vencimento usando o período passado como argumento
            this._next_billing_date = this.calculateNextBillingDate(
                this._start_date,
                billingPeriod
            );
            console.log(
                `[SubscriptionEntity] Próximo vencimento recalculado para: ${this._next_billing_date.toISOString()}`
            );
        }

        // 4. Valida o estado final
        this.validate();
    }

    // ==================================================================
    // HELPER PRIVADO SIMPLIFICADO (Regra de 30 dias)
    // ==================================================================
    private calculateNextBillingDate(
        startDate: Date,
        period: BillingPeriod
    ): Date {
        // Clona a data para não alterar o objeto original
        const nextDate = new Date(startDate.getTime());

        switch (period) {
            case 'MONTHLY':
                // Regra simples solicitada: Adiciona exatamente 30 dias.
                nextDate.setDate(nextDate.getDate() + 30);
                break;

            case 'YEARLY':
                // Por enquanto, lançamos erro se não for mensal, conforme solicitado.
                throw new CustomError(
                    'Período de cobrança ANUAL ainda não implementado na ativação.',
                    501
                );
            // Se fosse implementar simples: nextDate.setDate(nextDate.getDate() + 365);

            default:
                // Pega WEEKLY, QUARTERLY, etc.
                throw new CustomError(
                    `Período de cobrança não suportado para cálculo: ${period}`,
                    400
                );
        }

        return nextDate;
    } // Chamado se o usuário cancelar ou se o cron job detectar falta de pagamento
    public cancel(): void {
        this._status = 'CANCELED';
        this._end_date = new Date();
        this._updated_at = new Date();
    }

    private validate(): void {
        if (!this._subscription_plan_uuid) {
            throw new CustomError('Plano de assinatura é obrigatório.', 400);
        }
        // Garante que é OU empresa OU usuário
        if (
            (this._business_info_uuid && this._user_info_uuid) ||
            (!this._business_info_uuid && !this._user_info_uuid)
        ) {
            throw new CustomError(
                'A assinatura deve ter exatamente um pagador (empresa ou usuário).',
                400
            );
        }
    }

    public toJSON(): SubscriptionToJSONOutput {
        return {
            uuid: this._uuid.uuid,
            subscription_plan_uuid: this._subscription_plan_uuid.uuid,
            business_info_uuid: this._business_info_uuid?.uuid ?? null,
            user_info_uuid: this._user_info_uuid?.uuid ?? null,
            status: this._status,
            start_date: this._start_date,
            end_date: this._end_date,
            next_billing_date: this._next_billing_date,
            employer_item_details_uuid: this._employer_item_details_uuid?.uuid ?? null,
            user_item_uuid: this._user_item_uuid?.uuid ?? null,
            created_at: this._created_at,
            updated_at: this._updated_at,
        };
    }

    // --- FÁBRICA CRÍTICA PARA O FLUXO B2C ---
    // Este método prepara a assinatura quando o usuário clica em comprar.
    public static createForUserRequest(props: {
        user_info_uuid: Uuid;
        subscription_plan_uuid: Uuid;
        plan_billing_period: BillingPeriod;
        user_item_uuid: Uuid; // <--- ADICIONE ESTA LINHA AQUI NOS PARÂMETROS DO TIPO
    }): SubscriptionEntity {
        const now = new Date();
        let nextBilling: Date | null = null;

        if (props.plan_billing_period === 'MONTHLY') {
            nextBilling = new Date(now);
            nextBilling.setDate(nextBilling.getDate() + 30);
        } else if (props.plan_billing_period === 'YEARLY') {
            nextBilling = new Date(now);
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        }

        return new SubscriptionEntity({
            uuid: new Uuid(),
            subscription_plan_uuid: props.subscription_plan_uuid,
            user_info_uuid: props.user_info_uuid,
            status: 'PENDING_PAYMENT',
            start_date: now,
            next_billing_date: nextBilling,
            // Certifique-se de que está passando aqui no construtor também:
            user_item_uuid: props.user_item_uuid,
            created_at: now,
            updated_at: now,
        });
    }

    // Para reconstruir do banco de dados
    public static hydrate(props: SubscriptionProps): SubscriptionEntity {
        if (!props.uuid)
            throw new CustomError('UUID necessário para hidratação', 500);
        return new SubscriptionEntity(props);
    }
}
