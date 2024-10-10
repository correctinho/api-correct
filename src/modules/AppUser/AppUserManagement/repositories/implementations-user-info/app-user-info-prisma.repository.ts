import { date } from "zod";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { AppUserInfoEntity } from "../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../app-user-info.repository";
import { OutputGetEmployeesByBusinessDTO } from "../../usecases/UserInfo/get-users-by-business-admin/dto/get-user-by-business.dto";
import { randomUUID } from 'crypto'
import { urlencoded } from "express";
import { OutputFindUserDTO } from "../../usecases/UserInfo/get-user-info-by-user/dto/get-user-by-user.dto";

export class AppUserInfoPrismaRepository implements IAppUserInfoRepository {

  findByDocument2UserInfo(document2: string | null): Promise<AppUserInfoEntity> {
    throw new Error("Method not implemented.");
  }

  async create(data: AppUserInfoEntity): Promise<void> {
    await prismaClient.$transaction([

      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          businesses: {
            connect: data.business_info_uuids.map(business => ({ uuid: business }))
          },
          document: data.document,
          document2: data.document2,
          document3: data.document3,
          phone: data.phone,
          full_name: data.full_name,
          email: data.email,
          internal_company_code: data.internal_company_code,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          salary: data.salary,
          company_owner: data.company_owner,
          marital_status: data.marital_status,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at,

        }
      }),

      prismaClient.userAuth.update({
        where: {
          document: data.document
        },
        data: {
          user_info_uuid: data.uuid.uuid,
          updated_at: newDateF(new Date())
        }
      })
    ])
  }
  update(entity: AppUserInfoEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findAll(): Promise<AppUserInfoEntity[]> {
    throw new Error("Method not implemented.");
  }
  async find(id: Uuid): Promise<AppUserInfoEntity | null> {

    const user = await prismaClient.userInfo.findUnique({
      where: {
        uuid: id.uuid
      },
      include: {
        businesses: true,
        Employee: true
      }
    })
    if (!user) return null

    return {
      uuid: new Uuid(user.uuid),
      business_info_uuids: user.Employee.map(business => business.business_info_uuid),
      address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      internal_company_code: user.internal_company_code,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      salary: user.salary,
      company_owner: user.company_owner,
      status: user.status,
      function: user.function,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      marital_status: user.marital_status,
      dependents_quantity: user.dependents_quantity,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at
    } as AppUserInfoEntity

    // return {
    //   uuid: new Uuid(user.uuid),
    //   business_info_uuid: user.business_info_uuid ? new Uuid(user.business_info_uuid) : null,
    //   address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
    //   document: user.document,
    //   document2: user.document2,
    //   document3: user.document3,
    //   full_name: user.full_name,
    //   display_name: user.display_name,
    //   internal_company_code: user.internal_company_code,
    //   gender: user.gender,
    //   date_of_birth: user.date_of_birth,
    //   phone: user.phone,
    //   email: user.email,
    //   salary: user.salary,
    //   company_owner: user.company_owner,
    //   status: user.status,
    //   function: user.function,
    //   recommendation_code: user.recommendation_code,
    //   is_authenticated: user.is_authenticated,
    //   marital_status: user.marital_status,
    //   dependents_quantity: user.dependents_quantity,
    //   user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
    //   created_at: user.created_at,
    //   updated_at: user.updated_at

    // } as AppUserInfoEntity
  }

  async findManyByBusiness(business_info_uuid: string): Promise<OutputGetEmployeesByBusinessDTO[] | []> {
    const user = await prismaClient.employee.findMany({
      where: {
        business_info_uuid
      },
      include: {
        UserInfo: {
          include: {
            Address: true,
            UserItem: true
          }
        }
      }

    })
    return user as OutputGetEmployeesByBusinessDTO[] | []

  }


  async saveOrUpdateByCSV(data: AppUserInfoEntity): Promise<string> {

    await prismaClient.userInfo.upsert({
      where: {
        document: data.document
      },
      create: {
        uuid: data.uuid.uuid,
        document: data.document,
        document2: data.document2,
        full_name: data.full_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        phone: data.phone,
        email: data.email,
        status: data.status,
        recommendation_code: data.recommendation_code,
        is_authenticated: data.is_authenticated,
        marital_status: data.marital_status,
        user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
        created_at: data.created_at

      },
      update: {
        document: data.document,
        document2: data.document2,
        full_name: data.full_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        phone: data.phone,
        email: data.email,
        status: data.status,
        recommendation_code: data.recommendation_code,
        is_authenticated: data.is_authenticated,
        marital_status: data.marital_status,
        user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
        updated_at: data.updated_at

      }
    })
    return data.uuid.uuid
  }

  async createUserInfoAndEmployee(data: AppUserInfoEntity): Promise<AppUserInfoEntity> {
    const [user, employee] = await prismaClient.$transaction([
      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          document: data.document,
          document2: data.document2,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          phone: data.phone,
          email: data.email,
          status: data.status,
          recommendation_code: data.recommendation_code,
          is_authenticated: data.is_authenticated,
          marital_status: data.marital_status,
          user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
          created_at: data.created_at

        }
      }),
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          company_internal_code: data.internal_company_code,
          salary: data.salary,
          job_title: data.function,
          company_owner: data.company_owner,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at
        }
      })

    ])

    return {
      uuid: new Uuid(user.uuid),
      address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      internal_company_code: employee.company_internal_code,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      salary: employee.salary,
      company_owner: employee.company_owner,
      status: user.status,
      function: employee.job_title,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      is_employee: user.is_employee,
      marital_status: user.marital_status,
      dependents_quantity: employee.dependents_quantity,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at

    } as AppUserInfoEntity
  }


  async updateEmployeeByCSV(data: AppUserInfoEntity): Promise<any> {
    const [user, employee] = await prismaClient.$transaction([
      prismaClient.userInfo.update({
        where: {
          document: data.document
        },
        data: {
          uuid: data.uuid.uuid,
          document: data.document,
          document2: data.document2,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          phone: data.phone,
          email: data.email,
          status: data.status,
          recommendation_code: data.recommendation_code,
          is_authenticated: data.is_authenticated,
          marital_status: data.marital_status,
          user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
          created_at: data.created_at
        },

      }),
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          company_internal_code: data.internal_company_code,
          salary: data.salary,
          job_title: data.function,
          company_owner: data.company_owner,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at
        }
      })

    ])

    return {
      uuid: new Uuid(user.uuid),
      address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      internal_company_code: employee.company_internal_code,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      salary: employee.salary,
      company_owner: employee.company_owner,
      status: user.status,
      function: employee.job_title,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      is_employee: user.is_employee,
      marital_status: user.marital_status,
      dependents_quantity: employee.dependents_quantity,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at

    } as AppUserInfoEntity
  }
  async createUserInfoandUpdateUserAuthByCSV(data: AppUserInfoEntity) {
    await prismaClient.$transaction([
      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          document: data.document,
          document2: data.document2,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          phone: data.phone,
          email: data.email,
          status: data.status,
          recommendation_code: data.recommendation_code,
          is_authenticated: data.is_authenticated,
          marital_status: data.marital_status,
          user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
          created_at: data.created_at

        }
      }),
      prismaClient.userAuth.update({
        where: {
          document: data.document
        },
        data: {
          user_info_uuid: data.uuid.uuid,
          updated_at: newDateF(new Date())

        }
      }),
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          company_internal_code: data.internal_company_code,
          salary: data.salary,
          job_title: data.function,
          company_owner: data.company_owner,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at
        }
      })
    ])
  }

  async findByDocumentUserInfo(document: string): Promise<OutputFindUserDTO | null> {
    const user = await prismaClient.userInfo.findUnique({
      where: {
        document: document
      },
      include: {
        Employee: true
      }
    });

    if (!user) return null;

    return {
      uuid: user.uuid,
      address_uuid: user.address_uuid,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      gender: user.gender,
      email: user.email,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      status: user.status,
      recommendation_code: user.recommendation_code,
      marital_status: user.marital_status,
      is_employee: user.is_employee,
      user_document_validation_uuid: user.user_document_validation_uuid,
      created_at: user.created_at,
      updated_at: user.updated_at,
      Employee: user.Employee.map(emp => ({
        uuid: emp.uuid,
        business_info_uuid: emp.business_info_uuid,
        internal_company_code: emp.company_internal_code ?? null,
        salary: emp.salary,
        company_owner: emp.company_owner ?? false,
        function: emp.job_title ?? null,
        dependents_quantity: emp.dependents_quantity ?? 0,
        created_at: emp.created_at,
        updated_at: emp.updated_at
      }))
    };
  }

  async createEmployee(data: AppUserInfoEntity): Promise<any> {
    const employee = await prismaClient.employee.create({
      data: {
        uuid: randomUUID(),
        user_info_uuid: data.uuid.uuid,
        business_info_uuid: data.business_info_uuid.uuid,
        company_internal_code: data.internal_company_code,
        salary: data.salary,
        dependents_quantity: data.dependents_quantity,
        job_title: data.function,
        company_owner: data.company_owner,
        created_at: data.created_at
      }
    })

    return employee
  }

  async crateUserInfoAndEmployee(data: AppUserInfoEntity): Promise<AppUserInfoEntity> {
    const [user, employee] = await prismaClient.$transaction([
      prismaClient.userInfo.create({
        data: {
          uuid: data.uuid.uuid,
          document: data.document,
          document2: data.document2,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          phone: data.phone,
          email: data.email,
          status: data.status,
          recommendation_code: data.recommendation_code,
          is_authenticated: data.is_authenticated,
          marital_status: data.marital_status,
          user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
          created_at: data.created_at
        },

      }),
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          business_info_uuid: data.business_info_uuid.uuid,
          company_internal_code: data.internal_company_code,
          salary: data.salary,
          job_title: data.function,
          company_owner: data.company_owner,
          dependents_quantity: data.dependents_quantity,
          created_at: data.created_at
        }
      })

    ])

    return {
      uuid: new Uuid(user.uuid),
      address_uuid: user.address_uuid ? new Uuid(user.address_uuid) : null,
      document: user.document,
      document2: user.document2,
      document3: user.document3,
      full_name: user.full_name,
      display_name: user.display_name,
      internal_company_code: employee.company_internal_code,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      salary: employee.salary,
      company_owner: employee.company_owner,
      status: user.status,
      function: employee.job_title,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      is_employee: user.is_employee,
      marital_status: user.marital_status,
      dependents_quantity: employee.dependents_quantity,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at

    } as AppUserInfoEntity
  }

  async findEmployee(user_info_uuid: string, business_info_uuid: string): Promise<any> {
    const employee = await prismaClient.employee.findFirst({
      where: {
        user_info_uuid: user_info_uuid,
        business_info_uuid: business_info_uuid
      },
      include: {
        UserInfo: {
          include: {
            Address: true,
            UserItem: true
          }
        }
      }
    })

    return employee
  }

  async updateEmployee(data: AppUserInfoEntity, employee_uuid: string): Promise<any> {
    const employee = await prismaClient.employee.update({
      where: {
        uuid: employee_uuid
      },
      data: {
        company_internal_code: data.internal_company_code,
        salary: data.salary,
        dependents_quantity: data.dependents_quantity,
        job_title: data.function,
        company_owner: data.company_owner,
        updated_at: data.updated_at
      }
    })

    return employee
  }


  async createOrUpdateUserInfoByEmployer(data: AppUserInfoEntity): Promise<void> {
    await prismaClient.userInfo.upsert({
      where: {
        document: data.document
      },
      create: {
        uuid: data.uuid.uuid,
        document: data.document,
        document2: data.document2,
        document3: data.document3,
        phone: data.phone,
        full_name: data.full_name,
        email: data.email,
        internal_company_code: data.internal_company_code,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        salary: data.salary,
        company_owner: data.company_owner,
        marital_status: data.marital_status,
        dependents_quantity: data.dependents_quantity,
        created_at: data.created_at
      },
      update: {
        internal_company_code: data.internal_company_code,
        salary: data.salary,
        company_owner: data.company_owner,
        dependents_quantity: data.dependents_quantity,
        updated_at: newDateF(new Date())
      }
    });
  }

  // async findByEmailUserInfo(email: string): Promise<UserInfoResponse | null> {
  //     const user = await prismaClient.userInfo.findUnique({
  //         where: {
  //             email
  //         },
  //         include: {
  //             BusinessInfo: {
  //                 select: {
  //                     fantasy_name: true
  //                 }
  //             },
  //             Address: true,
  //             UserValidation: true,
  //             UserAuth: {
  //                 select:{
  //                     uuid: true,
  //                     document: true,
  //                     email: true,
  //                 }
  //             }
  //         }
  //     })

  //     return user as UserInfoResponse | null
  // }


}
