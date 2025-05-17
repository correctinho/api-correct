import { TransactionStatus, TransactionType } from "@prisma/client"; // Import enums from Prisma Client
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo'; // Assuming Uuid VO path
import { CustomError } from '../../../../errors/custom.error'; // Assuming CustomError path
import { newDateF } from '../../../../utils/date'; // Assuming date utility path

// Type for constructor properties, mirroring Prisma schema
export type TransactionProps = {
  uuid?: Uuid; // Optional: Will be generated if not provided
  user_item_uuid?: Uuid | null; // Optional in schema, reflects source UserItem FK
  user_debit_benefit_uuid?: Uuid | null; // Optional: FK to UserItem
  user_debit_benefit_balance?: number; // Optional: current balance in cents for user debit benefit
  favored_user_uuid?: Uuid | null; // Optional: Recipient UserInfo FK
  favored_business_info_uuid?: Uuid | null; // Optional: Recipient BusinessInfo FK
  amount: number; // Mandatory: Amount in cents
  // business_account_amount?: number // Optional: Amount in cents for business account to be incremented
  fee_amount?: number; // Optional: Defaults to 0
  cashback?: number; // Optional: Defaults to 0
  description?: string | null; // Optional
  status: TransactionStatus; // Mandatory
  transaction_type?: TransactionType; // Mandatory
  platform_net_amount?: number; // Optional: Amount in cents for platform net
  item_uuid?: string
  partner_user_uuid?: Uuid | null; // Optional: FK to PartnerUser
  created_at?: string; // Optional: Handled by constructor/DB
  updated_at?: string; // Optional: Handled by constructor/DB
};

// Type for data needed to create a new transaction (example)
export type TransactionCreateCommand = {
  user_item_uuid?: Uuid | null;
  favored_user_uuid?: Uuid | null;
  favored_business_info_uuid?: Uuid | null
  user_debit_benefit_uuid?: Uuid | null;
  user_debit_benefit_balance?: number;
  amount: number;
  // business_account_uuid?: Uuid | null;
  // business_account_balance?: number;
  business_account_amount?: number
  fee_amount?: number;
  cashback?: number;
  description?: string | null;
  status?: TransactionStatus; // Often starts as 'pending'
  // correct_account_uuid?: Uuid | null;
  // correct_account_balance?: number; // Optional: current balance in cents for correct account
  platform_net_amount?: number; // Optional: Amount in cents for platform net
  item_uuid?: string
  transaction_type?: TransactionType;
};

export class TransactionEntity {
  // Private properties corresponding to schema fields
  private _uuid: Uuid;
  private _user_item_uuid?: Uuid | null;
  private _user_debit_benefit_uuid?: Uuid | null;
  private _user_debit_benefit_balance?: number; // Optional: current balance in cents for user debit benefit
  private _favored_user_uuid: Uuid | null;
  private _favored_business_info_uuid: Uuid | null;
  private _amount: number;
  // private _business_account_uuid?: Uuid | null;
  // private _business_account_balance?: number; // Optional: current balance in cents for business account
  private _business_account_amount?: number
  private _fee_amount: number;
  private _cashback: number;
  private _description: string | null;
  private _status: TransactionStatus;
  private _transaction_type?: TransactionType;
  private _item_uuid?: string
  private _partner_user_uuid?: Uuid | null;
  private _correct_account_uuid?: Uuid | null;
  private _correct_account_balance?: number; // Optional: current balance in cents for correct account
  private _platform_net_amount?: number; // Optional: Amount in cents for platform net
  private _created_at: string;
  private _updated_at: string;

  constructor(props: TransactionProps) {
    // --- Assigning values and defaults ---
    this._uuid = props.uuid ?? new Uuid(); // Generate UUID if not provided
    this._user_item_uuid = props.user_item_uuid; // Can be null based on schema
    this._user_debit_benefit_uuid = props.user_debit_benefit_uuid ?? null; // Optional, can be null
    this._user_debit_benefit_balance = props.user_debit_benefit_balance ?? null; // Optional, can be null
    this._favored_user_uuid = props.favored_user_uuid ?? null;
    this._favored_business_info_uuid = props.favored_business_info_uuid ?? null;
    this._amount = props.amount;
    // this._business_account_amount = props.business_account_amount ?? null; // Optional, can be null
    this._fee_amount = props.fee_amount ?? 0; // Default fee to 0
    this._cashback = props.cashback ?? 0; // Default cashback to 0
    this._description = props.description ?? null;
    this._status = TransactionStatus.pending
    this._transaction_type = props.transaction_type; // Type must be provided
    this._item_uuid = props.item_uuid; // Item UUID must be provided
    this._platform_net_amount = props.platform_net_amount ?? null; // Optional, can be null
    // Use provided dates or generate new ones
    this._partner_user_uuid = props.partner_user_uuid ?? null;
    this._created_at = props.created_at ?? newDateF(new Date());
    this._updated_at = props.updated_at ?? newDateF(new Date());

    // --- Initial Validation ---
    this.validate();
  }

  // --- Getters ---
  get uuid(): Uuid { return this._uuid; }
  get user_item_uuid(): Uuid | null { return this._user_item_uuid; }
  get user_debit_benefit_uuid(): Uuid | null { return this._user_debit_benefit_uuid; }
  get user_debit_benefit_balance(): number | null { return this._user_debit_benefit_balance; }
  get favored_user_uuid(): Uuid | null { return this._favored_user_uuid; }
  get favored_business_info_uuid(): Uuid | null { return this._favored_business_info_uuid; }
  get amount(): number { return this._amount; }
  // get business_account_uuid(): Uuid | null { return this._business_account_uuid; }
  // get business_account_balance(): number | null { return this._business_account_balance; }
  get business_account_amount(): number | null { return this._business_account_amount; }
  get fee_amount(): number { return this._fee_amount; }
  get cashback(): number { return this._cashback; }
  get description(): string | null { return this._description; }
  get status(): TransactionStatus { return this._status; }
  get transaction_type(): TransactionType { return this._transaction_type; }
  get item_uuid(): string { return this._item_uuid; }
  get partner_user_uuid(): Uuid | null { return this._partner_user_uuid; }
  get correct_account_uuid(): Uuid | null { return this._correct_account_uuid; }
  get correct_account_balance(): number | null { return this._correct_account_balance; }
  get platform_net_amount(): number | null { return this._platform_net_amount; }
  get created_at(): string { return this._created_at; }
  get updated_at(): string { return this._updated_at; }

  // --- Methods to change state ---

  changeStatus(newStatus: TransactionStatus): void {
    if (newStatus === TransactionStatus.pending) {
      throw new CustomError("Cannot change status back to pending", 400);
   }

    this._status = newStatus;
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


  addDescription(description: string): void {
    this._description = description;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  changeBusinessInfoUuid(business_info_uuid: Uuid): void {
    this._favored_business_info_uuid = business_info_uuid;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  changeTransactionType(transaction_type: TransactionType): void {
    this._transaction_type = transaction_type;
    this.validate();
  }

  changeFeeAmount(fee_amount: number): void {
    if (fee_amount < 0) {
      throw new CustomError("Fee amount cannot be negative", 400);
    }
    this._fee_amount = fee_amount;
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  changeParnterUserUuid(partner_user_uuid: Uuid): void {
    this._partner_user_uuid = partner_user_uuid;
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
  // changeBusinessAccountUuid(business_account_uuid: Uuid): void {
  //   this._business_account_uuid = business_account_uuid;
  //   this.validate();
  // }

  // changeBusinessAccountBalance(business_account_balance: number): void {
  //   if (business_account_balance < 0) {
  //     throw new CustomError("Business account balance cannot be negative", 400);
  //   }
  //   this._business_account_balance = business_account_balance;
  //   this.validate();
  // }

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

  changePlatformNetAmount(platform_net_amount: number): void {
    if (platform_net_amount < 0) {
      throw new CustomError("Platform net amount cannot be negative", 400);
    }
    this._platform_net_amount = platform_net_amount;
    this.validate();
  }

  changeCashback(cashback: number): void {
    if (cashback < 0) {
      throw new CustomError("Cashback cannot be negative", 400);
    }
    this._cashback = cashback;
    this.validate();
  }
  // --- Validation Logic ---
  private validate(): void {
    // Basic mandatory field checks
    if (this._amount === undefined || this._amount === null || this._amount <= 0) {
      throw new CustomError("Amount must be a positive number", 400);
    }
    if (!this._status) {
      throw new CustomError("Status is required", 400);
    }
    if (!this._transaction_type) {
      throw new CustomError("Transaction type is required", 400);
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


    // Add other specific validations as needed (e.g., fee calculation logic, status transitions)
  }

  // --- Static factory method (optional but good practice) ---
  static create(command: TransactionCreateCommand): TransactionEntity {
    // Map command to props, setting initial status if needed
    const props: TransactionProps = {
      ...command,
      status: TransactionStatus.pending, // Este valor será ignorado pelo construtor
      favored_user_uuid: command.favored_user_uuid ?? null,
      favored_business_info_uuid: command.favored_business_info_uuid ?? null,
    };
    const transaction = new TransactionEntity(props);
    // Perform any specific logic needed only on initial creation here
    return transaction;
  }
}
