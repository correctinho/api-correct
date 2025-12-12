import { randomUUID } from 'crypto';
import { CustomError } from '../../../../errors/custom.error';
import { PasswordBCrypt } from '../../../../infra/shared/crypto/password.bcrypt';
import { z } from 'zod';
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo';
import { newDateF } from '../../../../utils/date';
import { DocumentValidator } from '../../../../utils/document-validation';
import { validate } from 'class-validator';
import { generateActionToken } from '../../../../@shared/utils/tokenProvider';
export type AppUserAuthProps = {
    uuid?: Uuid;
    user_info_uuid: Uuid | null;
    document: string;
    email: string;
    password: string;
    transaction_pin?: string | null;
    is_active: boolean;
    is_email_verified?: boolean;
    email_verification_token?: string | null;
    email_verification_expires_at?: string | Date | null;
    password_reset_token?: string | null;
    password_reset_expires_at?: string | Date | null
    created_at?: string;
    updated_at?: string;
};
export class AppUserAuthSignUpEntity {
    private _uuid: Uuid;
    private _user_info_uuid: Uuid | null;
    private _document: string;
    private _email: string;
    private _password: string;
    private _transaction_pin?: string | null;
    private _is_active: boolean;
    private _is_email_verified: boolean;
    private _email_verification_token: string | null;
    private _email_verification_expires_at: Date | null;
    private _password_reset_token: string | null;
    private _password_reset_expires_at: Date | null;
    private _created_at?: string;
    private _updated_at?: string;

    constructor(props: AppUserAuthProps) {
        this._uuid = props.uuid ?? new Uuid();
        this._user_info_uuid = props.user_info_uuid;
        this._document = props.document;
        this._email = props.email;
        this._password = props.password;
        this._transaction_pin = props.transaction_pin ?? null;
        this._is_active = props.is_active ?? true;
        this._created_at = newDateF(new Date());
        this._updated_at = newDateF(new Date());
        this._is_email_verified = props.is_email_verified ?? false;
        this._email_verification_token = props.email_verification_token ?? null;
        this._password_reset_token = props.password_reset_token ?? null;
        this._password_reset_expires_at = this.parseDate(props.password_reset_expires_at);

        if (props.email_verification_expires_at) {
            this._email_verification_expires_at =
                typeof props.email_verification_expires_at === 'string'
                    ? new Date(props.email_verification_expires_at)
                    : props.email_verification_expires_at;
        } else {
            this._email_verification_expires_at = null;
        }
        this.validate();
    }

    private parseDate(dateValue: string | Date | null | undefined): Date | null {
        if (!dateValue) return null;
        return typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    }

    get is_email_verified(): boolean {
        return this._is_email_verified;
    }
    get email_verification_token(): string | null {
        return this._email_verification_token;
    }
    get email_verification_expires_at(): Date | null {
        return this._email_verification_expires_at;
    }

    get uuid(): Uuid {
        return this._uuid;
    }

    get user_info_uuid(): Uuid | null {
        return this._user_info_uuid;
    }

    get document(): string {
        return this._document;
    }

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }
    get transaction_pin(): string | null | undefined {
        return this._transaction_pin;
    }
    get is_active(): boolean {
        return this._is_active;
    }

    get created_at(): string | undefined {
        return this._created_at;
    }

    get updated_at(): string | undefined {
        return this._updated_at;
    }

    get password_reset_token(): string | null { return this._password_reset_token; }
    get password_reset_expires_at(): Date | null { return this._password_reset_expires_at; }
    private set password(password: string) {
        this._password = password;
    }
    private set document(document: string) {
        this._document = document;
    }

    public generatePasswordResetToken(): string {
        // Usa o utilitário compartilhado com o tipo específico 'password_reset'
        const token = generateActionToken(this._uuid.uuid, 'password_reset');

        this._password_reset_token = token;

        // Define a expiração para 1 hora a partir de agora
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        this._password_reset_expires_at = expiresAt;

        return token;
    }

    public clearPasswordResetToken(): void {
        this._password_reset_token = null;
        this._password_reset_expires_at = null;
    }
    changeUserInfo(user_info_uuid: Uuid) {
        this._user_info_uuid = user_info_uuid;
        this.validate();
    }

    changeDocument(document: string) {
        this._document = document;
        this.validate();
    }

    changeEmail(email: string) {
        this._email = email;
        this.validate();
    }

    async changePassword(password: string) {
        const bcrypt = new PasswordBCrypt();
        const passwordHash = await bcrypt.hash(password);

        this._password = passwordHash;
        this.validate();
    }

    activate() {
        this._is_active = true;
        this.validate();
    }

    deactivate() {
        this._is_active = false;
        this.validate();
    }
    static hydrate(props: AppUserAuthProps): AppUserAuthSignUpEntity {
        return new AppUserAuthSignUpEntity(props);
    }
    public generateEmailVerificationToken(): string {
        // Usa a função utilitária que criamos no passo anterior
        const token = generateActionToken(this._uuid.uuid, 'email_validation');

        this._email_verification_token = token;

        // Define expiração para 24 horas a partir de agora
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        this._email_verification_expires_at = expiresAt;

        // Garanta que está como não verificado
        this._is_email_verified = false;

        return token;
    }

    public verifyEmail(): void {
        this._is_email_verified = true;
        this._email_verification_token = null;
        this._email_verification_expires_at = null;
        // Opcional: Se a regra for ativar o usuário ao validar o e-mail:
        // this.activate();
    }
    validate() {
        //Validate if necessary fields are present
        if (!this._document) throw new CustomError('Document is required', 400);
        if (!this._password) throw new CustomError('Password is required', 400);
        if (!this._email) throw new CustomError('Email is required', 400);

        //Validate field types
        if (typeof this._document !== 'string')
            throw new CustomError('Document must be string type', 400);
        if (typeof this._password !== 'string')
            throw new CustomError('Password must be string type', 400);
        if (typeof this._email !== 'string')
            throw new CustomError('Email must be string type', 400);

        // Validate email
        const emailSchema = z.string().email();
        const emailValidation = emailSchema.safeParse(this._email);

        if (!emailValidation.success)
            throw new CustomError('Invalid email format', 400);

        const adjustedDocument = new DocumentValidator();
        const validator = adjustedDocument.validator(this._document);
        if (validator) {
            this._document = validator;
        }
    }

    static async create(data: AppUserAuthProps) {
        const bcrypt = new PasswordBCrypt();
        const passwordHash = await bcrypt.hash(data.password);
        data.password = passwordHash;

        data.is_email_verified = false;

        const appUserRegister = new AppUserAuthSignUpEntity(data);
        return appUserRegister;
    }
}
