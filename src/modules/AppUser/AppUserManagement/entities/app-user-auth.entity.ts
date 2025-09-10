import { randomUUID } from 'crypto'
import { CustomError } from '../../../../errors/custom.error'
import { PasswordBCrypt } from '../../../../infra/shared/crypto/password.bcrypt'
import { z } from 'zod'
import { Uuid } from '../../../../@shared/ValueObjects/uuid.vo'
import { newDateF } from '../../../../utils/date'
import { DocumentValidator } from '../../../../utils/document-validation'
import { validate } from 'class-validator'
export type AppUserAuthProps = {
    uuid?: Uuid
    user_info_uuid: Uuid | null,
    document: string,
    email: string,
    password: string,
    transaction_pin?: string | null
    is_active: boolean
    created_at?: string
    updated_at?: string

}
export class AppUserAuthSignUpEntity {
    private _uuid: Uuid
    private _user_info_uuid: Uuid | null
    private _document: string
    private _email: string
    private _password: string
    private _transaction_pin?: string | null
    private _is_active: boolean
    private _created_at?: string
    private _updated_at?: string

    constructor(props: AppUserAuthProps) {
        this._uuid = props.uuid ?? new Uuid()
        this._user_info_uuid = props.user_info_uuid
        this._document = props.document
        this._email = props.email
        this._password = props.password
        this._transaction_pin = props.transaction_pin ?? null
        this._is_active = props.is_active ?? true
        this._created_at = newDateF(new Date())
        this._updated_at = newDateF(new Date())
        this.validate()
    }

    get uuid(): Uuid {
        return this._uuid
    }

    get user_info_uuid(): Uuid | null {
        return this._user_info_uuid
    }

    get document(): string {
        return this._document
    }

    get email(): string {
        return this._email
    }

    get password(): string {
        return this._password
    }
    get transaction_pin(): string | null | undefined {
        return this._transaction_pin
    }
    get is_active(): boolean {
        return this._is_active
    }

    get created_at(): string | undefined {
        return this._created_at
    }

    get updated_at(): string | undefined {
        return this._updated_at
    }

    private set password(password: string) {
        this._password = password

    }
    private set document(document: string) {
        this._document = document
    }

    changeUserInfo(user_info_uuid: Uuid) {
        this._user_info_uuid = user_info_uuid
        this.validate()
    }

    changeDocument(document: string) {
        this._document = document
        this.validate()
    }

    changeEmail(email: string) {
        this._email = email
        this.validate()
    }

    async changePassword(password: string) {
        const bcrypt = new PasswordBCrypt()
        const passwordHash = await bcrypt.hash(password)

        this._password = passwordHash
        this.validate()
    }

    activate() {
        this._is_active = true
        this.validate()
    }

    deactivate() {
        this._is_active = false
        this.validate()
    }

    validate() {
        //Validate if necessary fields are present
        if (!this._document) throw new CustomError("Document is required", 400)
        if (!this._password) throw new CustomError("Password is required", 400)
        if (!this._email) throw new CustomError("Email is required", 400)

        //Validate field types
        if (typeof this._document !== 'string') throw new CustomError("Document must be string type", 400)
        if (typeof this._password !== 'string') throw new CustomError("Password must be string type", 400)
        if (typeof this._email !== 'string') throw new CustomError("Email must be string type", 400)

        // Validate email
        const emailSchema = z.string().email();
        const emailValidation = emailSchema.safeParse(this._email);

        if (!emailValidation.success) throw new CustomError("Invalid email format", 400);

        const adjustedDocument = new DocumentValidator()
        const validator = adjustedDocument.validator(this._document)
        if (validator) {
            this._document = validator
        }
    }

    static async create(data: AppUserAuthProps) {

        const bcrypt = new PasswordBCrypt()
        const passwordHash = await bcrypt.hash(data.password)

        data.password = passwordHash

        const appUserRegister = new AppUserAuthSignUpEntity(data)
        return appUserRegister
    }
}