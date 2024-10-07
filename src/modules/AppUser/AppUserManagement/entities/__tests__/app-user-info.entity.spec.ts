import { Uuid } from '../../../../../@shared/ValueObjects/uuid.vo';
import { AppUserInfoProps, AppUserInfoEntity } from '../app-user-info.entity';
import { Status } from '@prisma/client';


describe("Unit Test AppUserInfoEntity", () => {
  it("Should throw an error if full_name is empty", () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: '',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    expect(() => {
      new AppUserInfoEntity(input);
    }).toThrow("Full name is required");
  });

  // it("Should throw an error if date_of_birth is empty", () => {
  //     const input: AppUserInfoProps = {
  //         business_info_uuid: null,
  //         address_uuid: null,
  //         document: '403.539.780-60',
  //         document2: null,
  //         document3: null,
  //         full_name: 'John Doe',
  //         display_name: null,
  //         internal_company_code: null,
  //         gender: 'M',
  //         date_of_birth: '1990-05-02',
  //         phone: null,
  //         email: 'email@email.com',
  //         salary: null,
  //         company_owner: false,
  //         status: Status.active,
  //         function: null,
  //         recommendation_code: null,
  //         is_authenticated: false,
  //         marital_status: null,
  //         dependents_quantity: 0,
  //         user_document_validation_uuid: null
  //     };

  //     expect(() => {
  //         new AppUserInfoEntity(input);
  //     }).toThrow("Date of birth is required");
  // });

  it("Should throw an error if gender is empty", () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: '',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    expect(() => {
      new AppUserInfoEntity(input);
    }).toThrow("Gender is required");
  });

  it("Should create an AppUserInfoEntity", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = await AppUserInfoEntity.create(input);

    expect(userInfo).toHaveProperty('uuid');
    expect(userInfo.full_name).toEqual(input.full_name);
    expect(userInfo.document).toEqual('40353978060');
  });


  it("Should add a Business info uuid", () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    const newUuid = new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
    userInfo.addBusinessInfoUuid(newUuid);

    expect(userInfo.business_info_uuids).toContainEqual(newUuid.uuid);
  });

  it("Should remove a Business info uuid", () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    const newUuid = new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
    userInfo.addBusinessInfoUuid(newUuid);
    userInfo.removeBusinessInfoUuid(newUuid);

    expect(userInfo.business_info_uuids).not.toContainEqual(newUuid);
  });


  it("Should change Address uuid", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeAddressUuid(new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c'));;

    expect(userInfo.address_uuid?.uuid).toEqual('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
  });
  it("Should change document", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeDocument('727.646.740-66');

    expect(userInfo.document).toEqual('72764674066');
  });

  it("Should change document2", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeDocument2('09876543210');

    expect(userInfo.document2).toEqual('09876543210');
  });
  it("Should change document3", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeDocument3('09876543210');

    expect(userInfo.document3).toEqual('09876543210');
  });

  it("Should change full_name", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '403.539.780-60',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeFullName('Jane Doe');

    expect(userInfo.full_name).toEqual('Jane Doe');
  });


  it("Should change display name", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeDisplayName('Jane Doe');

    expect(userInfo.display_name).toEqual('Jane Doe');
  });

  it("Should change internal company code", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeInternalCompanyCode('4a8ds4va');

    expect(userInfo.internal_company_code).toEqual('4a8ds4va');
  });

  it("Should change gender", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeGender('F');

    expect(userInfo.gender).toEqual('F');
  });

  it("Should change date of birth", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeDateOfBirth('1991-01-01');

    expect(userInfo.date_of_birth).toEqual('1991-01-01');
  });

  it("Should change phone", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changePhone('215842891');

    expect(userInfo.phone).toEqual('215842891');
  });

  it("Should change email", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeEmail('new-email@email.com');

    expect(userInfo.email).toEqual('new-email@email.com');
  });

  it("Should change salary", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeSalary(15000);

    expect(userInfo.salary).toEqual(15000);
  });

  it("Should change company owner", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeCompanyOwner(true);

    expect(userInfo.company_owner).toEqual(true);
  });

  it("Should change status", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeStatus(Status.inactive);

    expect(userInfo.status).toEqual(Status.inactive);
  });

  it("Should change function", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeStatus(Status.inactive);

    expect(userInfo.status).toEqual(Status.inactive);
  });
  it("Should change userDocumentValidationUuid", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeUserDocumentValidationUuid(new Uuid('8ecfc6ca-b943-4c50-afd2-f86c32542b8c'));

    expect(userInfo.user_document_validation_uuid?.uuid).toEqual('8ecfc6ca-b943-4c50-afd2-f86c32542b8c');
  });

  it("Should change status", async () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    const userInfo = new AppUserInfoEntity(input);
    userInfo.changeStatus(Status.inactive);

    expect(userInfo.status).toEqual(Status.inactive);
  });


  it("Should throw an error if document does not have only numbers", () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '1234567892545',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'email@email.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    expect(() => {
      new AppUserInfoEntity(input);
    }).toThrow("Document must have 11 characters")
  })

  it("Should throw an error if email is not valid", () => {
    const input: AppUserInfoProps = {
      business_info_uuid: null,
      address_uuid: null,
      document: '727.646.740-66',
      document2: null,
      document3: null,
      full_name: 'John Doe',
      display_name: null,
      internal_company_code: null,
      gender: 'M',
      date_of_birth: '1990-05-02',
      phone: null,
      email: 'emailemail.com',
      salary: null,
      company_owner: false,
      status: Status.active,
      function: null,
      recommendation_code: null,
      is_authenticated: false,
      marital_status: null,
      dependents_quantity: 0,
      user_document_validation_uuid: null
    };

    expect(() => {
      new AppUserInfoEntity(input);
    }).toThrow("Invalid email format")
  })

});
