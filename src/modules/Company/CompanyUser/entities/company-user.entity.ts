import { PasswordBcrypt } from '../../../../crypto/password.bcrypt'
import { BusinessTypeOptions, Permissions, Status } from '@prisma/client'
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo'
import { newDateF } from '../../../../utils/date'
import { DocumentValidator } from '../../../../utils/document-validation'
import { z } from 'zod'
import { CustomError } from '../../../../errors/custom.error'
import jwt from 'jsonwebtoken'

export type CompanyUserProps = {
  uuid?: Uuid
  business_info_uuid: Uuid,
  is_admin: boolean,
  document: string | null,
  name: string | null,
  email: string | null,
  user_name: string | null,
  password: string
  function: string | null
  permissions: Permissions[],
  status: Status,
  business_type?: BusinessTypeOptions | null,
  password_reset_token?: string | null
  password_reset_expires_at?: Date | null
}

export class CompanyUserEntity {
  private _uuid?: Uuid
  private _business_info_uuid: Uuid
  private _is_admin: boolean
  private _document: string | null
  private _name: string | null
  private _email: string | null
  private _user_name: string | null
  private _password: string
  private _function: string | null
  private _permissions: Permissions[]
  private _status: Status
  private _created_at?: string;
  private _updated_at?: string;
  private _business_type?: BusinessTypeOptions | null
  
  // Backing fields para recuperação de senha
  private _password_reset_token?: string | null;
  private _password_reset_expires_at?: Date | null;


  constructor(props: CompanyUserProps) {
    this._uuid = props.uuid ?? new Uuid()
    this._business_info_uuid = props.business_info_uuid
    this._email = props.email
    this._document = props.document
    this._name = props.name
    this._is_admin = props.is_admin ?? true
    this._permissions = props.permissions
    this._user_name = props.user_name
    this._password = props.password
    this._function = props.function
    this._status = props.status
    this._password_reset_token = props.password_reset_token
    this._password_reset_expires_at = props.password_reset_expires_at
    this._business_type = props.business_type;
    this._created_at = newDateF(new Date());
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  // Getters existentes...
  get uuid(): Uuid { return this._uuid!; }
  get business_info_uuid(): Uuid { return this._business_info_uuid; }
  get is_admin(): boolean { return this._is_admin; }
  get document(): string | null { return this._document; }
  get name(): string | null { return this._name; }
  get email(): string | null { return this._email; }
  get user_name(): string | null { return this._user_name; }
  get password(): string { return this._password; }
  get function(): string | null { return this._function; }
  get permissions(): Permissions[] { return this._permissions; }
  get status(): Status { return this._status; }
  get created_at(): string | undefined { return this._created_at; }
  get updated_at(): string | undefined { return this._updated_at; }

  get business_type(): BusinessTypeOptions | null | undefined {
    return this._business_type;
  }
  
  // Novos Getters
  get password_reset_token(): string | null | undefined { return this._password_reset_token; }
  get password_reset_expires_at(): Date | null | undefined { return this._password_reset_expires_at; }

  async updatePassword(password: string){
    const bcrypt = new PasswordBcrypt()
    const passwordHash = await bcrypt.hash(password)
    this._password = passwordHash
    this.validate()
  }

  async createPassword(password: string){
    this._password = password
    this.validate()
  }

  // --- Lógica de Recuperação de Senha ---

  generatePasswordResetToken(): string {
    // Gera token JWT com expiração de 1h
    const token = jwt.sign(
      { sub: this._uuid!.uuid, type: 'password_reset' },
      process.env.SECRET_KEY_TOKEN_COMPANY_ADMIN as string, 
      { expiresIn: '1h' }
    );

    this._password_reset_token = token;
    
    // Define data de expiração no banco (1 hora a partir de agora)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    this._password_reset_expires_at = expires;

    return token;
  }

  clearPasswordResetToken() {
    this._password_reset_token = null;
    this._password_reset_expires_at = null;
  }

  // Setters existentes...
  changeUuid(uuid: Uuid) { this._uuid = uuid; this.validate(); }
  changeBusinessInfoUuid(business_info_uuid: Uuid) { this._business_info_uuid = business_info_uuid; this.validate(); }
  changeIsAdmin(is_admin: boolean) { this._is_admin = is_admin; this.validate(); }
  changeDocument(document: string) { this._document = document; this.validate(); }
  changeName(name: string) { this._name = name; this.validate(); }
  changeEmail(email: string) { this._email = email; this.validate(); }
  changeUserName(user_name: string) { this._user_name = user_name; this.validate(); }
  changeFunction(func: string) { this._function = func; this.validate(); }
  changePermissions(permissions: Permissions[]) { this._permissions = permissions; this.validate(); }
  changeStatus(status: Status) { this._status = status; this.validate(); }

  validate() {
    if (!this.business_info_uuid) throw new CustomError("Business Info Id is required", 400)
    if (this._document) {
      const adjustedDocument = new DocumentValidator()
      const validator = adjustedDocument.validator(this._document)
      if (validator) { this._document = validator }
    }
    if (this.email) {
      const emailSchema = z.string().email();
      const emailValidation = emailSchema.safeParse(this._email);
      if (!emailValidation.success) throw new CustomError("Invalid email format", 400);
    }
  }

  static async create(data: CompanyUserProps) {
    const companyUser = new CompanyUserEntity(data)
    const bcrypt = new PasswordBcrypt()
    const passwordHash = await bcrypt.hash(companyUser.password)
    companyUser.createPassword(passwordHash)
    return companyUser
  }
}