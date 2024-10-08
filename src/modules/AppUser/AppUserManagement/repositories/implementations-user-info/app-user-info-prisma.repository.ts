import { date } from "zod";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../../infra/databases/prisma.config";
import { newDateF } from "../../../../../utils/date";
import { AppUserInfoEntity } from "../../entities/app-user-info.entity";
import { IAppUserInfoRepository } from "../app-user-info.repository";
import { OutputGetEmployeesByBusinessDTO } from "../../usecases/UserInfo/get-users-by-business-admin/dto/get-user-by-business.dto";

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
        businesses: true
      }
    })
    if (!user) return null

    return {
      uuid: new Uuid(user.uuid),
      business_info_uuids: user.businesses.map(business => business.uuid),
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
    const user = await prismaClient.userInfo.findMany({
      where: {
        businesses: {
          some: {
            uuid: business_info_uuid
          }
        }
      },
      include: {
        Address: true
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
        businesses: {
          connect: data.business_info_uuids.map(business => ({ uuid: business}))
        },
        document: data.document,
        document2: data.document2,
        full_name: data.full_name,
        internal_company_code: data.internal_company_code,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        salary: data.salary,
        phone: data.phone,
        email: data.email,
        company_owner: data.company_owner,
        status: data.status,
        function: data.function,
        recommendation_code: data.recommendation_code,
        is_authenticated: data.is_authenticated,
        marital_status: data.marital_status,
        dependents_quantity: data.dependents_quantity,
        user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
        created_at: data.created_at

      },
      update: {
        businesses: {
          //set: [], // Remove todas as relações existentes
          connect: data.business_info_uuids.map(business => ({ uuid: business })) // Adiciona as novas relações
        },
        document: data.document,
        document2: data.document2,
        full_name: data.full_name,
        internal_company_code: data.internal_company_code,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        salary: data.salary,
        phone: data.phone,
        email: data.email,
        company_owner: data.company_owner,
        status: data.status,
        function: data.function,
        recommendation_code: data.recommendation_code,
        is_authenticated: data.is_authenticated,
        marital_status: data.marital_status,
        dependents_quantity: data.dependents_quantity,
        user_document_validation_uuid: data.user_document_validation_uuid ? data.user_document_validation_uuid.uuid : null,
        updated_at: data.updated_at

      }
    })
    return data.uuid.uuid
  }

  async createUserInfoandUpdateUserAuthByCSV(userInfo: AppUserInfoEntity) {
    await prismaClient.$transaction([
      prismaClient.userInfo.upsert({
        where: {
          document: userInfo.document
        },
        create: {
          uuid: userInfo.uuid.uuid,
          businesses: {
            connect: userInfo.business_info_uuids.map(business => ({ uuid: business }))
          },
          document: userInfo.document,
          document2: userInfo.document2,
          full_name: userInfo.full_name,
          internal_company_code: userInfo.internal_company_code,
          gender: userInfo.gender,
          date_of_birth: userInfo.date_of_birth,
          salary: userInfo.salary,
          phone: userInfo.phone,
          email: userInfo.email,
          company_owner: userInfo.company_owner,
          status: userInfo.status,
          function: userInfo.function,
          recommendation_code: userInfo.recommendation_code,
          is_authenticated: userInfo.is_authenticated,
          marital_status: userInfo.marital_status,
          dependents_quantity: userInfo.dependents_quantity,
          user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
          created_at: userInfo.created_at
        },
        update: {
          businesses: {
            set: [], // Remove todas as relações existentes
            connect: userInfo.business_info_uuids.map(business => ({ uuid: business })) // Adiciona as novas relações
          },
          document: userInfo.document,
          document2: userInfo.document2,
          full_name: userInfo.full_name,
          internal_company_code: userInfo.internal_company_code,
          gender: userInfo.gender,
          date_of_birth: userInfo.date_of_birth,
          salary: userInfo.salary,
          phone: userInfo.phone,
          email: userInfo.email,
          company_owner: userInfo.company_owner,
          status: userInfo.status,
          function: userInfo.function,
          recommendation_code: userInfo.recommendation_code,
          is_authenticated: userInfo.is_authenticated,
          marital_status: userInfo.marital_status,
          dependents_quantity: userInfo.dependents_quantity,
          user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
          updated_at: newDateF(new Date())
        }
      }),
      prismaClient.userAuth.update({
        where: {
          document: userInfo.document
        },
        data: {
          user_info_uuid: userInfo.uuid.uuid,
          updated_at: newDateF(new Date())

        }
      })
    ])
  }

  async findByDocumentUserInfo(document: string): Promise<AppUserInfoEntity | null> {
    const user = await prismaClient.userInfo.findUnique({
      where: {
        document: document
      },
      include: {
        businesses: true
      }

    })
    if (!user) return null


    return {
      uuid: new Uuid(user.uuid),
      business_info_uuids: user.businesses.map(business => business.uuid),
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
  }

  async createOrUpdateUserInfoByEmployer(data: AppUserInfoEntity): Promise<void> {
    await prismaClient.userInfo.upsert({
      where: {
        document: data.document
      },
      create: {
        uuid: data.uuid.uuid,
        businesses: {
          connect: data.business_info_uuids.map((business_uuid: any) => ({ uuid: business_uuid}))
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
        created_at: data.created_at
      },
      update: {
        businesses: {
          //set: [], // Remove todas as relações existentes
          connect: data.business_info_uuids.map((business_uuid:any) => ({ uuid: business_uuid })) //consertar este any
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

  // async findByDocument2UserInfo(document2: string): Promise<UserInfoResponse | null> {
  //     const user = await prismaClient.userInfo.findUnique({
  //         where: {
  //             document2
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
  // async findByDocument3UserInfo(document3: string): Promise<UserInfoResponse | null> {
  //     const user = await prismaClient.userInfo.findFirst({
  //         where: {
  //             document3
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
