import { TransactionStatus, TransactionType } from "@prisma/client"; // Import enums from Prisma Client
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo'; // Assuming Uuid VO path
import { CustomError } from '../../../../errors/custom.error'; // Assuming CustomError path
import { newDateF } from '../../../../utils/date'; // Assuming date utility path
import { sub } from "date-fns";

//VALORES MONETÁRIOS SÃO INTEIROS EM CENTAVOS
// Exemplo: 1000 representa R$ 10,00
// Descontos e taxas são armazenados como porcentagens multiplicadas por 10000 para precisão
// Exemplo: 150000 representa 15,00%

export type TransactionProps = {
  uuid?: Uuid; // Optional: Will be generated if not provided
  user_item_uuid?: Uuid | null; // Optional in schema, reflects source UserItem FK
  user_debit_benefit_uuid?: Uuid | null; // Optional: FK to UserItem
  user_debit_benefit_balance?: number; // Optional: current balance in cents for user debit benefit
  favored_user_uuid?: Uuid | null; // Optional: Recipient UserInfo FK
  favored_business_info_uuid?: Uuid | null; // Optional: Recipient BusinessInfo FK
  original_price: number; // Mandatory: original price before discount
  discount_percentage: number; // Mandatory: discount provided
  net_price: number; // Mandatory: final price after discount
  // business_account_amount?: number // Optional: Amount in cents for business account to be incremented
  fee_percentage?: number; // Optional: Defaults to 0
  fee_amount?: number; // Optional: Defaults to 0
  partner_credit_amount: number; // valor que deve ser creditado ao parceiro
  cashback?: number; // Optional: Defaults to 0
  partner_cashback_percentage?: number; // Optional: Defaults to 0
  platform_net_fee_amount?: number; // Valor líquido que a plataforma fica (bruto - cashback)
  description?: string | null; // Optional
  status: TransactionStatus; // Mandatory
  transaction_type?: TransactionType; // Mandatory
  paid_at?: string | null; // Optional: Date when the transaction was paid
  item_uuid?: string
  favored_partner_user_uuid?: Uuid | null; // Optional: FK to PartnerUser
  used_offline_token_code?: string
  provider_tx_id?: string | null; 
  payer_business_info_uuid?: Uuid | null;
  pix_e2e_id?: string | null;
  subscription_uuid?: Uuid | null; // Optional: FK to Subscription (if applicable)
  created_at?: string; // Optional: Handled by constructor/DB
  updated_at?: string; // Optional: Handled by constructor/DB
};

// Type for data needed to create a new transaction (example)
export type TransactionCreateCommand = {
  // --- Dados essenciais vindos da API ---
  original_price: number;
  discount_percentage: number;
  net_price: number;

  // --- Dados de contexto/relacionamento ---
  user_item_uuid?: Uuid | null;
  favored_user_uuid?: Uuid | null;
  favored_business_info_uuid?: Uuid | null;
  transaction_type?: TransactionType;
  description?: string | null;
  subscription_uuid?: Uuid | null;

  used_offline_token_code?: string
};

export class TransactionEntity {
  // Private properties corresponding to schema fields
  private _uuid: Uuid;
  private _user_item_uuid?: Uuid | null;
  private _user_debit_benefit_uuid?: Uuid | null;
  private _user_debit_benefit_balance?: number; // Optional: current balance in cents for user debit benefit
  private _favored_user_uuid: Uuid | null;
  private _favored_business_info_uuid: Uuid | null;
  private _original_price: number;
  private _discount_percentage: number;
  private _net_price: number; // Optional: discount value
  private _partner_credit_amount: number; //valor que deve ser creditado ao parceiro
  // private _business_account_uuid?: Uuid | null;
  // private _business_account_balance?: number; // Optional: current balance in cents for business account
  private _business_account_amount?: number
  private _fee_percentage?: number; // Optional: Defaults to 0
  private _fee_amount: number;
  private _cashback: number;
  private _partner_cashback_percentage: number
  private _platform_net_fee_amount: number; // Valor líquido que a plataforma fica (bruto - cashback)
  private _description: string | null;
  private _status: TransactionStatus;
  private _transaction_type?: TransactionType;
  private _paid_at?: string | null; // Optional: Date when the transaction was paid
  private _item_uuid?: string
  private _favored_partner_user_uuid?: Uuid | null;
  private _correct_account_uuid?: Uuid | null;
  private _correct_account_balance?: number; // Optional: current balance in cents for correct account
  private _provider_tx_id?: string | null; // <-- Adicionado
  private _pix_e2e_id?: string | null; 
  private _used_offline_token_code?: string
  private _payer_business_info_uuid?: Uuid | null;
  private _subscription_uuid?: Uuid | null;
  private _created_at: string;
  private _updated_at: string;

  private constructor(props: TransactionProps) {
    // O construtor agora apenas atribui os valores que recebe.
    this._uuid = props.uuid ?? new Uuid();
    this._user_item_uuid = props.user_item_uuid;
    this._user_debit_benefit_uuid = props.user_debit_benefit_uuid ?? null;
    this._user_debit_benefit_balance = props.user_debit_benefit_balance ?? null;
    this._favored_user_uuid = props.favored_user_uuid ?? null;
    this._favored_business_info_uuid = props.favored_business_info_uuid ?? null;

    // SEM MULTIPLICAÇÃO AQUI
    this._original_price = props.original_price;
    this._discount_percentage = props.discount_percentage;
    this._net_price = props.net_price;
    this._fee_percentage = props.fee_percentage ?? 0;

    // Campos calculados são inicializados
    this._fee_amount = props.fee_amount ?? 0;
    this._cashback = props.cashback ?? 0;
    this._partner_cashback_percentage ?? 0
    this._platform_net_fee_amount = props.platform_net_fee_amount ?? 0;
    this._partner_credit_amount = props.partner_credit_amount ?? 0;
    this._description = props.description ?? null;
    this._status = props.status ?? TransactionStatus.pending;
    this._transaction_type = props.transaction_type;
    this._paid_at = newDateF(new Date());
    this._item_uuid = props.item_uuid;
    this._favored_partner_user_uuid = props.favored_partner_user_uuid ?? null;

    this._provider_tx_id = props.provider_tx_id ?? null;
    this._pix_e2e_id = props.pix_e2e_id ?? null; 

    this._payer_business_info_uuid = props.payer_business_info_uuid ?? null;
    this._used_offline_token_code = props.used_offline_token_code
    this._subscription_uuid = props.subscription_uuid ?? null;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = newDateF(new Date());
  }
  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  get user_item_uuid(): Uuid | null { return this._user_item_uuid; }
  get user_debit_benefit_uuid(): Uuid | null { return this._user_debit_benefit_uuid; }
  get user_debit_benefit_balance(): number | null { return this._user_debit_benefit_balance; }
  get favored_user_uuid(): Uuid | null { return this._favored_user_uuid; }
  get favored_business_info_uuid(): Uuid | null { return this._favored_business_info_uuid; }
  get original_price(): number { return this._original_price / 100; }
  get discount_percentage(): number { return this._discount_percentage / 10000; }
  get net_price(): number { return this._net_price / 100; }
  get paid_at(): string | null { return this._paid_at; }
  // get business_account_uuid(): Uuid | null { return this._business_account_uuid; }
  // get business_account_balance(): number | null { return this._business_account_balance; }
  get business_account_amount(): number | null { return this._business_account_amount; }
  get fee_percentage(): number | undefined { return this._fee_percentage / 10000; }
  get fee_amount(): number { return this._fee_amount / 100; }
  get cashback(): number { return this._cashback / 100; }
  get partner_cashback_percentage(): number { return this._partner_cashback_percentage / 10000; }
  get partner_credit_amount(): number { return this._partner_credit_amount / 100; }
  get platform_net_fee_amount(): number { return this._platform_net_fee_amount / 100; }
  get description(): string | null { return this._description; }
  get status(): TransactionStatus { return this._status; }
  get transaction_type(): TransactionType { return this._transaction_type; }
  get item_uuid(): string { return this._item_uuid; }
  get favored_partner_user_uuid(): Uuid | null { return this._favored_partner_user_uuid; }
  get correct_account_uuid(): Uuid | null { return this._correct_account_uuid; }
  get correct_account_balance(): number | null { return this._correct_account_balance; }
  get provider_tx_id(): string | null { return this._provider_tx_id; }
  get pix_e2e_id(): string | null { return this._pix_e2e_id; }
  get used_offline_token_code(): string | null { return this._used_offline_token_code }
  get payer_business_info_uuid(): Uuid | null { return this._payer_business_info_uuid; }
  get subscription_uuid(): Uuid | null { return this._subscription_uuid; }
  get created_at(): string { return this._created_at; }
  get updated_at(): string { return this._updated_at; }

  setPixPaymentDetails(endToEndId: string, paidAt: string): void {
        if (this._status !== TransactionStatus.pending) {
            throw new CustomError(`Cannot set PIX payment details on a transaction that is not 'pending'. Current status: ${this._status}`, 400);
        }
        this._pix_e2e_id = endToEndId;
        this._paid_at = paidAt;
        this._status = TransactionStatus.success; // Automaticamente marca como sucesso
        this._updated_at = newDateF(new Date());
        this.validate();
    }

    
    setProviderTxId(txid: string): void {
        if (this._provider_tx_id && this._provider_tx_id !== txid) {
            console.warn(`Provider TX ID already set for transaction ${this.uuid.uuid}. Overwriting from ${this._provider_tx_id} to ${txid}.`);
        }
        this._provider_tx_id = txid;
        this._updated_at = newDateF(new Date());
        this.validate();
    }

  changeStatus(newStatus: TransactionStatus): void {

    this._status = newStatus;
    this.validate();
  }

  setPartnerCashbackPercentage(percentage: number): void {
    if (percentage < 0) throw new CustomError("Partner cashback percentage cannot be negative", 400);
    this._partner_cashback_percentage = percentage;
    this.validate();
}
  completeTransaction(command: {
    user_item_uuid?: Uuid; // Source must be defined on completion
    favored_user_uuid?: Uuid | null;
    favored_business_info_uuid?: Uuid | null;
    status: Extract<TransactionStatus, 'success' | 'fail'> // Must be success or fail
  }): void {
    if (this._status !== TransactionStatus.pending) {
      throw new CustomError(`Transaction status must be 'pending' to be completed. Current status: ${this._status}`, 400);
    }
    this._user_item_uuid = command.user_item_uuid; // Ensure source is set
    this._favored_user_uuid = command.favored_user_uuid ?? null;
    this._favored_business_info_uuid = command.favored_business_info_uuid ?? null;
    this._status = command.status;
    this._updated_at = newDateF(new Date());
    this.validate(); // Validate final state
  }


  changeFavoredBusinessInfoUuid(business_info_uuid: Uuid): void {
    this._favored_business_info_uuid = business_info_uuid;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  changeTransactionType(transaction_type: TransactionType): void {
    this._transaction_type = transaction_type;
    this.validate();
  }

  changePartnerUserUuid(partner_user_uuid: Uuid): void {
    this._favored_partner_user_uuid = partner_user_uuid;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  changeUserItemUuid(user_item_uuid: Uuid): void {
    this._user_item_uuid = user_item_uuid;
    this.validate();
  }

  changeUserDebitBenefitUuid(user_debit_benefit_uuid: Uuid): void {
    this._user_debit_benefit_uuid = user_debit_benefit_uuid;
    this.validate();
  }

  changeUserDebitBenefitBalance(user_debit_benefit_balance: number): void {
    if (user_debit_benefit_balance < 0) {
      throw new CustomError("User debit benefit balance cannot be negative", 400);
    }
    this._user_debit_benefit_balance = user_debit_benefit_balance;
    this.validate();
  }


  changeBusinessAccountAmount(business_account_amount: number): void {
    if (business_account_amount < 0) {
      throw new CustomError("Business account amount cannot be negative", 400);
    }
    this._business_account_amount = business_account_amount;
    this.validate();
  }

  changeCorrectAccountUuid(correct_account_uuid: Uuid): void {
    this._correct_account_uuid = correct_account_uuid;
    this.validate();
  }

  changeCorrectAccountBalance(correct_account_balance: number): void {
    if (correct_account_balance < 0) {
      throw new CustomError("Correct account balance cannot be negative", 400);
    }
    this._correct_account_balance = correct_account_balance;
    this.validate();
  }


  calculateFeePercentage(admin_tax: number, marketing_tax: number): void {
    if (admin_tax < 0 || marketing_tax < 0) {
      throw new CustomError("Admin and marketing taxes cannot be negative", 400);
    }

    // CORREÇÃO: Como os valores já vêm escalados do PartnerConfig (ex: 15000),
    // nós apenas os somamos. 
    this._fee_percentage = admin_tax + marketing_tax;
    
    this.validate();
  }

  changeUsedOfflineToken(token: string) {
    this._used_offline_token_code = token
    this.validate()
  }

// TransactionEntity.ts - Revisão FINAL com regra de arredondamento de 0.x para 1 centavo

calculateFee(): void {
    if (this._net_price === undefined || this._fee_percentage === undefined) {
        throw new CustomError("Net price and fee percentage must be set before calculating the fee", 400);
    }

    const netPriceBigInt = BigInt(this._net_price); // Garante que _net_price seja BigInt para cálculos

    // 1. Calcular _fee_amount (taxa TOTAL que a plataforma cobra da transação)
    const calculatedFeeBigInt = (netPriceBigInt * BigInt(this._fee_percentage)) / BigInt(1000000);
    this._fee_amount = Number(calculatedFeeBigInt); // Armazenar em centavos como Number

    let totalCashbackForUserBigInt = 0n;
    let partnerCashbackAmountBigInt = 0n;
    let platformCashbackAmountBigInt = 0n;

    // 2. Cashback do Parceiro (se _partner_cashback_percentage > 0)
    if (this._partner_cashback_percentage !== undefined && this._partner_cashback_percentage > 0) {
        // Cálculo do cashback base antes do arredondamento
        const rawPartnerCashbackBigInt = (netPriceBigInt * BigInt(this._partner_cashback_percentage)); // Numerador
        // Arredondamento para 1 centavo se a fração for > 0, senão truncar para 0
        if (rawPartnerCashbackBigInt > 0n && (rawPartnerCashbackBigInt % 1000000n !== 0n)) {
             // Se o valor real seria 0.x centavos (ex: 0.8), e queremos 1 centavo.
             // Isso significa que a parte inteira de centavos (rawPartnerCashbackBigInt / 1000000n) seria 0,
             // mas o resto é > 0. Neste caso, forçamos para 1 centavo.
            partnerCashbackAmountBigInt = (rawPartnerCashbackBigInt / 1000000n) + 1n; // Arredonda para cima se houver fração
        } else {
            partnerCashbackAmountBigInt = rawPartnerCashbackBigInt / 1000000n;
        }
    }
    totalCashbackForUserBigInt += partnerCashbackAmountBigInt;


    // 3. Cashback da Plataforma (SEMPRE 20% do _fee_amount total)
    const PLATFORM_CASHBACK_PERCENTAGE = 20n;
    const rawPlatformCashbackBigInt = (calculatedFeeBigInt * PLATFORM_CASHBACK_PERCENTAGE); // Numerador
    // Arredondamento para 1 centavo se a fração for > 0, senão truncar para 0
    if (rawPlatformCashbackBigInt > 0n && (rawPlatformCashbackBigInt % 100n !== 0n)) {
        // Se o valor real seria 0.x centavos, e queremos 1 centavo.
        platformCashbackAmountBigInt = (rawPlatformCashbackBigInt / 100n) + 1n; // Arredonda para cima se houver fração
    } else {
        platformCashbackAmountBigInt = rawPlatformCashbackBigInt / 100n;
    }
    totalCashbackForUserBigInt += platformCashbackAmountBigInt;


    // 4. Setar o _cashback total (o que o usuário recebe)
    this._cashback = Number(totalCashbackForUserBigInt);


    // 5. Calcular _partner_credit_amount (o que o parceiro recebe)
    this._partner_credit_amount = Number(netPriceBigInt - calculatedFeeBigInt);


    // 6. Calcular _platform_net_fee_amount (o que a plataforma retém para si)
    // A plataforma retém a taxa total MENOS o cashback que ELA mesma gerou.
    // Como platformCashbackAmountBigInt pode ser 1 centavo agora, mesmo para fee_amount de 4 centavos,
    // o _platform_net_fee_amount pode diminuir.
    this._platform_net_fee_amount = Number(calculatedFeeBigInt - platformCashbackAmountBigInt);
    // Embora a regra de 20% normalmente não leve a negativo, se o fee_amount for 0 e o cashback for 1,
    // isso seria negativo. A regra de negócio é que cashback não pode consumir *toda* a taxa.
    // Se o fee_amount for 0, o cashback da plataforma é 0.
    // Se o fee_amount for 4, o cashback da plataforma é 1. platform_net_fee_amount = 3.
    // Isso está ok.
    if (this._platform_net_fee_amount < 0) {
        this._platform_net_fee_amount = 0; // Garantia, caso a regra de 20% ou outra condição mude
    }

    this.validate();
}


  changeDescription(description: string): void {
    this._description = description;
    this.validate();
  }

  // --- Validation Logic ---
  private validate(): void {
    // Basic mandatory field checks
    if (this._original_price <= 0) {
      throw new CustomError("Original price must be a positive number", 400);
    }
    if (this._discount_percentage < 0) {
      throw new CustomError("Discount percentage cannot be negative", 400);
    }
    if (this._net_price < 0) {
      throw new CustomError("Final price (net_price) cannot be negative", 400);
    }

    if (!this._status) {
      throw new CustomError("Status is required", 400);
    }
    if (!this._transaction_type) {
      throw new CustomError("Transaction type is required", 400);
    }

    const discountAmount = Math.round((this._original_price * this._discount_percentage) / 1000000);

    if (this._net_price !== this._original_price - discountAmount) {
      throw new CustomError("Net price is not consistent with original price and discount percentage", 400);
    }

    // Validation for recipient based on type (when status indicates completion/processing)
    // This logic might need refinement based on when exactly fields become mandatory
    if (this._status === 'success') { // Example: Check on success
      // Source must be defined on success
      if (!this._user_item_uuid) {
        throw new CustomError("Source user item (user_item_uuid) is required for a successful transaction", 400);
      }

      const hasUserRecipient = !!this._favored_user_uuid;
      const hasBusinessRecipient = !!this._favored_business_info_uuid;

      // Ensure exactly one recipient type is set for successful transactions
      if (hasUserRecipient && hasBusinessRecipient) {
        throw new CustomError("Transaction cannot have both a user and a business recipient", 400);
      }
      if (!hasUserRecipient && !hasBusinessRecipient) {
        throw new CustomError("Successful transaction must have either a user or a business recipient", 400);
      }

      // Validate type against recipient
      if (this._transaction_type === 'P2P_TRANSFER' && !hasUserRecipient) {
        throw new CustomError("P2P transfer must have a user recipient (favored_user_uuid)", 400);
      }
      if ((this._transaction_type === 'POS_PAYMENT' || this._transaction_type === 'ECOMMERCE_PAYMENT') && !hasBusinessRecipient) {
        throw new CustomError("Business payment must have a business recipient (favored_business_info_uuid)", 400);
      }

    }

    // Note: Validation for user_item_uuid being null might depend on the initial status.
    // If status starts as 'pending' and user_item_uuid is only determined later,
    // the check `!this._user_item_uuid` should only apply for relevant statuses (like 'sucess').
    // The schema allows user_item_uuid to be null, so initial validation might allow it.
    if (this.user_item_uuid === null && this.status !== 'pending') {
      console.warn(`Transaction ${this.uuid} has status ${this.status} but user_item_uuid is null.`);
      // Depending on rules, you might throw an error here for non-pending statuses
      // throw new CustomError("Source user item (user_item_uuid) cannot be null for non-pending transactions", 400);
    }
    const discountAmountInCents = Math.round((this._original_price * this._discount_percentage) / 1000000);

  }

  // Adicione este método dentro da sua classe TransactionEntity

  public toJSON() {
    return {
      uuid: this._uuid.uuid, // Use  ou o método correto para obter a string do VO
      user_item_uuid: this._user_item_uuid ? this._user_item_uuid.uuid : null,
      favored_user_uuid: this._favored_user_uuid ? this._favored_user_uuid.uuid : null,
      favored_business_info_uuid: this._favored_business_info_uuid ? this._favored_business_info_uuid.uuid : null,
      original_price: this._original_price,
      discount_percentage: this._discount_percentage,
      net_price: this._net_price,
      fee_percentage: this._fee_percentage,
      fee_amount: this._fee_amount,
      cashback: this._cashback,
      platform_net_fee_amount: this._platform_net_fee_amount,
      partner_credit_amount: this._partner_credit_amount,
      description: this._description,
      status: this._status,
      transaction_type: this._transaction_type,
      favored_partner_user_uuid: this._favored_partner_user_uuid ? this._favored_partner_user_uuid.uuid : null,
      provider_tx_id: this._provider_tx_id, 
      pix_e2e_id: this._pix_e2e_id,
      used_offline_token_code: this._used_offline_token_code,
      paid_at: this._paid_at,
      payer_business_info_uuid: this._payer_business_info_uuid ? this._payer_business_info_uuid.uuid : null,
      subscription_uuid: this._subscription_uuid ? this._subscription_uuid.uuid : null,
      created_at: this._created_at,
      updated_at: this._updated_at
    };
  }
  // Adicione este método dentro da sua classe TransactionEntity

  static hydrate(props: TransactionProps): TransactionEntity {
    return new TransactionEntity(props);
  }
  // --- Static factory method (optional but good practice) ---
  static create(command: TransactionCreateCommand): TransactionEntity {
    // 1. Prepara os 'props' escalonando APENAS os dados de entrada
    const props: TransactionProps = {
      ...command,
      original_price: command.original_price * 100,
      discount_percentage: command.discount_percentage * 10000,
      net_price: command.net_price * 100,
      status: TransactionStatus.pending,

      // Garante que campos calculados não sejam passados aqui
      fee_percentage: 0,
      fee_amount: 0,
      cashback: 0,
      partner_credit_amount: 0,
      platform_net_fee_amount: 0
    };

    // 2. Cria a entidade com os dados preparados
    const entity = new TransactionEntity(props);

    // 3. Valida o estado inicial da entidade
    entity.validate();
    return entity;
  }

  static createForSubscriptionPixPayment(command: {
    subscription_uuid: Uuid;
    user_info_uuid: Uuid; // Quem está pagando
    user_item_uuid: Uuid; // O item que será ativado
    amountInCents: number; // Valor total em CENTAVOS
    provider_tx_id: string; // O ID do Sicredi
  }): TransactionEntity {
    
    const props: TransactionProps = {
      uuid: new Uuid(),
      
   
      subscription_uuid: command.subscription_uuid,
      
      user_item_uuid: command.user_item_uuid,
      favored_user_uuid: command.user_info_uuid, 

      // Valores Monetários
      original_price: command.amountInCents,
      net_price: command.amountInCents,
      discount_percentage: 0,

      // Campos Calculados Zerados
      fee_percentage: 0,
      fee_amount: 0,
      cashback: 0,
      partner_cashback_percentage: 0,
      partner_credit_amount: 0,
      platform_net_fee_amount: 0,

      status: TransactionStatus.pending,
      transaction_type: TransactionType.SUBSCRIPTION_PAYMENT, 

      // O ID DO SICREDI
      provider_tx_id: command.provider_tx_id,
      
      created_at: newDateF(new Date()),
      updated_at: newDateF(new Date())
    };

    return new TransactionEntity(props);
  }
}
