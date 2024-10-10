import { Status } from "@prisma/client";
import { randomUUID } from 'crypto';
import { newDateF } from "../../../../utils/date";
import { CustomError } from "../../../../errors/custom.error";
import { z } from "zod";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { DocumentValidator } from "../../../../utils/document-validation";

export type AppUserInfoProps = {
  uuid?: Uuid
  business_info_uuid: Uuid | null;
  address_uuid: Uuid | null;
  document: string;
  document2: string | null;
  document3: string | null;
  full_name: string;
  display_name: string | null;
  internal_company_code: string | null;
  gender: string | null;
  date_of_birth: string;
  phone: string | null;
  email: string | null
  salary: number | null;
  company_owner: boolean;
  status: Status;
  function: string | null;
  recommendation_code: string | null;
  is_authenticated: boolean;
  marital_status: string | null;
  dependents_quantity: number;
  user_document_validation_uuid: Uuid | null;
  is_employee?: boolean
  created_at?: string
  updated_at?: string
};

export type AppUserInfoCreateCommand = {
  business_info_uuid: Uuid | null;
  address_uuid: Uuid | null;
  document: string;
  document2: string | null;
  document3: string | null;
  full_name: string;
  display_name: string | null;
  internal_company_code: string | null;
  gender: string | null;
  date_of_birth: string;
  phone: string | null;
  email: string | null
  salary: number | null;
  company_owner: boolean
  status: Status;
  function: string | null;
  recommendation_code: string | null;
  is_authenticated: boolean;
  marital_status: string | null;
  dependents_quantity: number;
  user_document_validation_uuid: Uuid | null;
  is_employee?: boolean
  created_at?: string
  updated_at?: string
}

export class AppUserInfoEntity {
  private _uuid: Uuid;
  private _business_info_uuids: string[];
  private _business_info_uuid: Uuid
  private _address_uuid: Uuid | null;
  private _document: string;
  private _document2: string | null;
  private _document3: string | null;
  private _full_name: string;
  private _display_name: string | null;
  private _internal_company_code: string | null;
  private _gender: string | null;
  private _date_of_birth: string;
  private _phone: string | null;
  private _email: string;
  private _salary: number | null;
  private _company_owner: boolean;
  private _status: Status;
  private _function: string | null;
  private _recommendation_code: string | null;
  private _is_authenticated: boolean;
  private _marital_status: string | null;
  private _dependents_quantity: number;
  private _user_document_validation_uuid: Uuid | null;
  private _is_employee: boolean
  private _created_at?: string;
  private _updated_at?: string;

  constructor(props: AppUserInfoProps) {
    this._uuid = props.uuid ?? new Uuid();
    this._business_info_uuids = props.business_info_uuid ? [props.business_info_uuid.uuid] : [];
    this._business_info_uuid = props.business_info_uuid
    this._address_uuid = props.address_uuid;
    this._document = props.document;
    this._document2 = props.document2;
    this._document3 = props.document3;
    this._full_name = props.full_name;
    this._display_name = props.display_name;
    this._internal_company_code = props.internal_company_code;
    this._gender = props.gender;
    this._date_of_birth = props.date_of_birth;
    this._phone = props.phone;
    this._email = props.email;
    this._salary = props.salary;
    this._company_owner = props.company_owner ?? false;
    this._status = props.status ?? Status.pending;
    this._function = props.function;
    this._recommendation_code = props.recommendation_code;
    this._is_authenticated = props.is_authenticated ?? false;
    this._marital_status = props.marital_status;
    this._dependents_quantity = props.dependents_quantity;
    this._user_document_validation_uuid = props.user_document_validation_uuid;
    this._is_employee = props.is_employee ?? false
    this._created_at = newDateF(new Date());
    this._updated_at = newDateF(new Date());
    this.validate();
  }

  get uuid(): Uuid {
    return this._uuid;
  }

  get business_info_uuids(): string[] {
    return this._business_info_uuids;
  }
  get business_info_uuid(): Uuid {
    return this._business_info_uuid;
  }

  get address_uuid(): Uuid | null {
    return this._address_uuid;
  }

  get document(): string {
    return this._document;
  }

  get document2(): string | null {
    return this._document2;
  }

  get document3(): string | null {
    return this._document3;
  }

  get full_name(): string {
    return this._full_name;
  }

  get display_name(): string | null {
    return this._display_name;
  }

  get internal_company_code(): string | null {
    return this._internal_company_code;
  }

  get gender(): string | null {
    return this._gender;
  }

  get date_of_birth(): string {
    return this._date_of_birth;
  }

  get phone(): string | null {
    return this._phone;
  }

  get email(): string {
    return this._email
  }

  get salary(): number | null {
    return this._salary;
  }

  get company_owner(): boolean {
    return this._company_owner;
  }

  get status(): Status {
    return this._status;
  }

  get function(): string | null {
    return this._function;
  }

  get recommendation_code(): string | null {
    return this._recommendation_code;
  }

  get is_authenticated(): boolean {
    return this._is_authenticated;
  }

  get marital_status(): string | null {
    return this._marital_status;
  }

  get dependents_quantity(): number {
    return this._dependents_quantity;
  }

  get user_document_validation_uuid(): Uuid {
    return this._user_document_validation_uuid;
  }

  get is_employee(): boolean {
    return this._is_employee
  }

  get created_at(): string | undefined {
    return this._created_at;
  }

  get updated_at(): string | undefined {
    return this._updated_at
  }

  changeUuid(uuid: Uuid){
    this._uuid = uuid
    this.validate()
  }

  addBusinessInfoUuid(business_info_uuid: Uuid) {
    if (!this._business_info_uuids.includes(business_info_uuid.uuid)) {
      this._business_info_uuids.push(business_info_uuid.uuid);
      this.validate();
    }
  }

  removeBusinessInfoUuid(business_info_uuid: Uuid) {
    this._business_info_uuids = this._business_info_uuids.filter(uuid => uuid !== business_info_uuid.uuid);
    this.validate();
  }

  changeAddressUuid(address_uuid: Uuid) {
    this._address_uuid = address_uuid;
    this.validate();
  }

  changeDocument(document: string) {
    this._document = document;
    this.validate();
  }

  changeDocument2(document2: string) {
    this._document2 = document2;
    this.validate();
  }

  changeDocument3(document3: string) {
    this._document3 = document3;
    this.validate();
  }

  changeFullName(full_name: string) {
    this._full_name = full_name;
    this.validate();
  }

  changeDisplayName(display_name: string) {
    this._display_name = display_name;
    this.validate();
  }

  changeInternalCompanyCode(internal_company_code: string) {
    this._internal_company_code = internal_company_code;
    this.validate();
  }

  changeGender(gender: string) {
    this._gender = gender;
    this.validate();
  }


  changeDateOfBirth(date_of_birth: string) {
    this._date_of_birth = date_of_birth;
    this.validate();
  }

  changePhone(phone: string) {
    this._phone = phone;
    this.validate();
  }

  changeEmail(email: string) {
    this._email = email
    this.validate()
  }

  changeSalary(salary: number) {
    this._salary = salary;
    this.validate();
  }

  changeCompanyOwner(company_owner: boolean) {
    this._company_owner = company_owner;
    this.validate();
  }

  changeStatus(status: Status) {
    this._status = status;
    this.validate();
  }

  changeFunction(func: string) {
    this._function = func;
    this.validate();
  }

  changeRecommendationCode(recommendation_code: string) {
    this._recommendation_code = recommendation_code;
    this.validate();
  }

  changeIsAuthenticated(is_authenticated: boolean) {
    this._is_authenticated = is_authenticated;
    this.validate();
  }

  changeMaritalStatus(marital_status: string) {
    this._marital_status = marital_status;
    this.validate();
  }

  changeDependentsQuantity(dependents_quantity: number) {
    this._dependents_quantity = dependents_quantity;
    this.validate();
  }

  changeUserDocumentValidationUuid(user_document_validation_uuid: Uuid) {
    this._user_document_validation_uuid = user_document_validation_uuid;
    this.validate();
  }
  validate() {

    //rules validations
    // if(!this.document) throw new CustomError("Document is required", 400)
    // if(!this.email) throw new CustomError("Email is required")
    if (!this.full_name) throw new CustomError("Full name is required", 400);
    if (!this.date_of_birth) throw new CustomError("Date of birth is required", 400);
    if (!this.gender) throw new CustomError("Gender is required", 400);

    //types validation
    // this._business_info_uuids.forEach(uuid => {
    //   if (!(uuid instanceof Uuid)) {
    //     throw new CustomError("Each business info UUID must be an instance of Uuid", 400);
    //   }
    // });

    if (this.address_uuid && !(this.address_uuid instanceof Uuid))
      throw new CustomError("Address UUID must be instanceof Uuid", 400);

    if (this.document2 && typeof this.document2 !== 'string')
      throw new CustomError("Document 2 must be a string", 400);

    if (this.document3 && typeof this.document3 !== 'string')
      throw new CustomError("Document 3 must be a string", 400);

    if (typeof this.full_name !== 'string')
      throw new CustomError("Full name must be a string", 400);

    if (this.display_name && typeof this.display_name !== 'string')
      throw new CustomError("Display name must be a string", 400);

    if (this.internal_company_code && typeof this.internal_company_code !== 'string')
      throw new CustomError("Internal company code must be a string", 400);

    if (typeof this.gender !== 'string')
      throw new CustomError("Gender must be a string", 400);

    if (typeof this.date_of_birth !== 'string')
      throw new CustomError("Date of birth must be a string", 400);

    if (this.phone && typeof this.phone !== 'string')
      throw new CustomError("Phone must be a string", 400);

    if (this.salary && typeof this.salary !== 'number')
      throw new CustomError("Salary must be a number", 400);

    if (typeof this.company_owner !== 'boolean')
      throw new CustomError("Company owner must be a boolean", 400);

    if (!(this.status in Status))
      throw new CustomError("Status must be a valid status", 400);

    if (this.function && typeof this.function !== 'string')
      throw new CustomError("Function must be a string", 400);

    if (this.recommendation_code && typeof this.recommendation_code !== 'string')
      throw new CustomError("Recommendation code must be a string", 400);

    if (typeof this.is_authenticated !== 'boolean')
      throw new CustomError("Is authenticated must be a boolean", 400);

    if (this.marital_status && typeof this.marital_status !== 'string')
      throw new CustomError("Marital status must be a string", 400);

    if (typeof this.dependents_quantity !== 'number')
      throw new CustomError("Dependents quantity must be a number", 400);

    if (this.user_document_validation_uuid && !(this.user_document_validation_uuid instanceof Uuid)) {
      throw new CustomError("User document validation UUID must be an instance of Uuid", 400);
    }

    //validate document length
    if (this._document) {

      const adjustedDocument = new DocumentValidator()
      const validator = adjustedDocument.validator(this._document)
      if (validator) {
        this._document = validator
      }
    }

    // Validate email
    if (this.email) {

      const emailSchema = z.string().email();
      const emailValidation = emailSchema.safeParse(this._email);

      if (!emailValidation.success) throw new CustomError("Invalid email format", 400);
    }

  }


  static async create(data: AppUserInfoCreateCommand) {
    const user = new AppUserInfoEntity(data);
    return user;
  }
}
