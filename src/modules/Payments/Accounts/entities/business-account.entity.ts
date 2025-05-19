import { randomUUID } from 'crypto'
import { newDateF } from '../../../../utils/date';
import { CustomError } from '../../../../errors/custom.error';
import { BusinessAccountStatus } from '@prisma/client';

export type BusinessAccountProps = {
  uuid?: string
  balance: number
  business_info_uuid: string
  status: BusinessAccountStatus
  created_at?: string
  updated_at?: string
}

export type BusinessAccountCreateCommand = {
  balance: number
  business_info_uuid: string
  status: BusinessAccountStatus
  created_at?: string
  updated_at?: string
}

export class BusinessAccountEntity {
  _uuid: string;
  _balance: number;
  _business_info_uuid: string;
  _status: BusinessAccountStatus
  _created_at: string;
  _updated_at: string;

  constructor(props: any) {
    this._uuid = props.uuid || randomUUID();
    this._business_info_uuid = props.business_info_uuid;
    this._balance = props.balance;
    this._status = props.status ?? 'active';
    this._created_at = newDateF(new Date())
    this._updated_at = newDateF(new Date())
    this.validate()
  }

  get uuid(): string {
    return this._uuid;
  }
  get balance(): number {
    return this._balance;
  }
  get business_info_uuid(): string {
    return this._business_info_uuid;
  }

  get status(): BusinessAccountStatus {
    return this._status;
  }

  get created_at(): string {
    return this._created_at;
  }
  get updated_at(): string {
    return this._updated_at;
  }
  set balance(value: number) {
    if (value < 0) {
      throw new CustomError('Balance cannot be negative', 400);
    }
    this._balance = value;
    this.validate()
  }
  set business_info_uuid(value: string) {
    if (!value) {
      throw new CustomError('Business info UUID cannot be empty', 400);
    }
    this._business_info_uuid = value;
    this.validate()
  }

  changeBalance(value: number) {
    if (value < 0) {
      throw new CustomError('Balance cannot be negative', 400);
    }
    this._balance = value;
    this.validate()
  }

  inactivateBusinessAccount() {
    this._status = 'inactive';
    this.validate()
  }

  activateBusinessAccount() {
    this._status = 'active';
    this.validate()
  }

  validate(){
    if(!this._business_info_uuid) {
      throw new CustomError('Business info UUID is required', 400);
    }
    if(this._balance < 0) {
      throw new CustomError('Balance cannot be negative', 400);
    }
  }

  static create(props: BusinessAccountCreateCommand): BusinessAccountEntity {
    const businessAccount = new BusinessAccountEntity(props);
    return businessAccount;
  }
}
