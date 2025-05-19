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
import { AppUserItemEntity } from "../../entities/app-user-item.entity";

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
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          marital_status: data.marital_status,
          is_employee: data.is_employee,
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
      }),

      prismaClient.userItem.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          item_uuid: data.debit_benefit_uuid.uuid,
          item_name: "Correct",
          balance: 0,
          status: "active",
          created_at: newDateF(new Date()),
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
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
      email: user.email,
      status: user.status,
      recommendation_code: user.recommendation_code,
      is_authenticated: user.is_authenticated,
      marital_status: user.marital_status,
      is_employee: user.is_employee,
      user_document_validation_uuid: user.user_document_validation_uuid ? new Uuid(user.user_document_validation_uuid) : null,
      created_at: user.created_at,
      updated_at: user.updated_at
    } as AppUserInfoEntity

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

  async saveOrUpdateByCSV(userInfo: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<void> {
    // Utiliza uma transação explícita para garantir atomicidade.
    await prismaClient.$transaction(async (tx) => {
      // 1. Verifica se o userInfo já existe.
      const existingUserInfo = await tx.userInfo.findUnique({
        where: { document: userInfo.document },
        select: { uuid: true }
      });

      let userInfoUuid: string;

      if (existingUserInfo) {
        // --- CENÁRIO DE ATUALIZAÇÃO (UPDATE) ---
        // O userInfo já existe, apenas atualiza.
        console.log(`UserInfo encontrado para documento ${userInfo.document}. Atualizando...`);
        const updatedUserInfo = await tx.userInfo.update({
          where: { document: userInfo.document },
          data: {
            // Campos para atualizar userInfo
            document: userInfo.document,
            document2: userInfo.document2,
            full_name: userInfo.full_name,
            gender: userInfo.gender,
            date_of_birth: userInfo.date_of_birth,
            phone: userInfo.phone,
            email: userInfo.email,
            status: userInfo.status,
            recommendation_code: userInfo.recommendation_code,
            is_authenticated: userInfo.is_authenticated,
            marital_status: userInfo.marital_status,
            is_employee: userInfo.is_employee,
            user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
            updated_at: userInfo.updated_at ?? newDateF(new Date())
          },
          select: { uuid: true }
        });
        userInfoUuid = updatedUserInfo.uuid;
        console.log(`UserInfo atualizado com UUID: ${userInfoUuid}`);

      } else {
        // --- CENÁRIO DE CRIAÇÃO (CREATE) ---
        // O userInfo não existe, cria o userInfo E o userItem "Correct".
        console.log(`UserInfo não encontrado para documento ${userInfo.document}. Criando...`);

        // Cria o userInfo
        const createdUserInfo = await tx.userInfo.create({
          data: {
            // Campos para criar userInfo
            uuid: userInfo.uuid.uuid,
            document: userInfo.document,
            document2: userInfo.document2,
            full_name: userInfo.full_name,
            gender: userInfo.gender,
            date_of_birth: userInfo.date_of_birth,
            phone: userInfo.phone,
            email: userInfo.email,
            status: userInfo.status,
            recommendation_code: userInfo.recommendation_code,
            is_authenticated: userInfo.is_authenticated,
            marital_status: userInfo.marital_status,
            is_employee: userInfo.is_employee,
            user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
            created_at: userInfo.created_at ?? newDateF(new Date())
          },
          select: { uuid: true }
        });
        userInfoUuid = createdUserInfo.uuid; // Armazena o novo UUID.
        console.log(`UserInfo criado com UUID: ${userInfoUuid}`);

        // --- LÓGICA ADICIONAL: Cria o userItem "Correct" ---
        // Verifica se o debit_benefit_uuid necessário está presente em userInfo
        if (userInfo.debit_benefit_uuid && userInfo.debit_benefit_uuid.uuid) {
          console.log(`Criando userItem "Correct" associado para userInfo UUID: ${userInfoUuid}`);
          await tx.userItem.create({
            data: {
              uuid: randomUUID(), // Gera um novo UUID para este item específico
              user_info_uuid: userInfoUuid, // Associa ao userInfo recém-criado
              item_uuid: userInfo.debit_benefit_uuid.uuid, // Pega do objeto userInfo de entrada
              item_name: "Correct", // Valor fixo conforme a regra
              balance: 0, // Valor fixo conforme a regra
              status: "active", // Valor fixo conforme a regra
              created_at: newDateF(new Date()), // Define a data de criação
              // Adicione outros campos obrigatórios do userItem aqui, se necessário.
              // Se business_info_uuid ou group_uuid forem obrigatórios e não
              // fizerem sentido para este item "Correct", você precisará ajustar
              // o schema ou fornecer valores padrão/nulos válidos.
              // Exemplo (se forem nullable ou tiverem default):
              // business_info_uuid: null, // Ou um UUID padrão, se aplicável
              // group_uuid: null, // Ou um UUID padrão, se aplicável
            }
          });
          console.log(`UserItem "Correct" criado com sucesso.`);
        } else {
          // Loga um aviso ou lança um erro se o UUID necessário não foi fornecido
          console.warn(`O campo 'debit_benefit_uuid' não foi fornecido ou é inválido no objeto userInfo para o documento ${userInfo.document}. O userItem "Correct" não será criado.`);
          // Se a criação deste item for absolutamente mandatória, descomente a linha abaixo:
          // throw new Error(`Criação falhou: 'debit_benefit_uuid' é obrigatório para criar um novo usuário e seu item 'Correct'. Documento: ${userInfo.document}`);
        }
        // --- FIM DA LÓGICA ADICIONAL ---
      }

      // 2. Processa o array employeeItem (UserItems) usando upsert (INDEPENDENTE DE CREATE/UPDATE do userInfo).
      // Esta parte continua como antes, garantindo que os itens do CSV sejam processados.
      if (employeeItem && employeeItem.length > 0) {
        console.log(`Processando ${employeeItem.length} userItems do array para userInfo UUID: ${userInfoUuid}...`);
        const userItemOperations = employeeItem.map((item) =>
          tx.userItem.upsert({
            where: { uuid: item.uuid.uuid },
            create: {
              // Dados para criar item do array
              uuid: item.uuid.uuid,
              user_info_uuid: userInfoUuid, // Associa ao UUID correto do userInfo
              business_info_uuid: item.business_info_uuid.uuid,
              item_uuid: item.item_uuid.uuid,
              item_name: item.item_name,
              balance: item.balance,
              group_uuid: item.group_uuid.uuid,
              status: item.status,
              blocked_at: item.blocked_at,
              cancelled_at: item.cancelled_at,
              block_reason: item.block_reason,
              cancel_reason: item.cancel_reason,
              grace_period_end_date: item.grace_period_end_date,
              created_at: item.created_at ?? newDateF(new Date()),
            },
            update: {
              // Dados para atualizar item do array
              user_info_uuid: userInfoUuid, // Garante a associação correta
              business_info_uuid: item.business_info_uuid.uuid,
              item_uuid: item.item_uuid.uuid,
              item_name: item.item_name,
              balance: item.balance,
              group_uuid: item.group_uuid.uuid,
              status: item.status,
              blocked_at: item.blocked_at,
              cancelled_at: item.cancelled_at,
              block_reason: item.block_reason,
              cancel_reason: item.cancel_reason,
              grace_period_end_date: item.grace_period_end_date,
              updated_at: item.updated_at ?? newDateF(new Date()),
            }
          })
        );

        await Promise.all(userItemOperations);
        console.log(`${employeeItem.length} userItems do array processados com sucesso.`);
      } else {
        console.log("Nenhum employeeItem no array fornecido para processar.");
      }

    }); // Fim da transação $transaction
  }

  // async saveOrUpdateByCSV(userInfo: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<void> {
  //   await prismaClient.$transaction([
  //     prismaClient.userInfo.upsert({
  //       where: {
  //         document: userInfo.document
  //       },
  //       create: {
  //         uuid: userInfo.uuid.uuid,
  //         document: userInfo.document,
  //         document2: userInfo.document2,
  //         full_name: userInfo.full_name,
  //         gender: userInfo.gender,
  //         date_of_birth: userInfo.date_of_birth,
  //         phone: userInfo.phone,
  //         email: userInfo.email,
  //         status: userInfo.status,
  //         recommendation_code: userInfo.recommendation_code,
  //         is_authenticated: userInfo.is_authenticated,
  //         marital_status: userInfo.marital_status,
  //         is_employee: userInfo.is_employee,
  //         user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
  //         created_at: userInfo.created_at
  //       },
  //       update: {
  //         document: userInfo.document,
  //         document2: userInfo.document2,
  //         full_name: userInfo.full_name,
  //         gender: userInfo.gender,
  //         date_of_birth: userInfo.date_of_birth,
  //         phone: userInfo.phone,
  //         email: userInfo.email,
  //         status: userInfo.status,
  //         recommendation_code: userInfo.recommendation_code,
  //         is_authenticated: userInfo.is_authenticated,
  //         marital_status: userInfo.marital_status,
  //         is_employee: userInfo.is_employee,
  //         user_document_validation_uuid: userInfo.user_document_validation_uuid ? userInfo.user_document_validation_uuid.uuid : null,
  //         updated_at: userInfo.updated_at
  //       }
  //     }),

  //     ...employeeItem.map((item) =>
  //       prismaClient.userItem.upsert({
  //         where: {
  //           uuid: item.uuid.uuid
  //         },
  //         create: {
  //           uuid: item.uuid.uuid,
  //           user_info_uuid: item.user_info_uuid.uuid,
  //           business_info_uuid: item.business_info_uuid.uuid,
  //           item_uuid: item.item_uuid.uuid,
  //           item_name: item.item_name,
  //           balance: item.balance,
  //           group_uuid: item.group_uuid.uuid,
  //           status: item.status,
  //           blocked_at: item.blocked_at,
  //           cancelled_at: item.cancelled_at,
  //           block_reason: item.block_reason,
  //           cancel_reason: item.cancel_reason,
  //           grace_period_end_date: item.grace_period_end_date,
  //           created_at: item.created_at,
  //         },
  //         update: {
  //           user_info_uuid: item.user_info_uuid.uuid,
  //           business_info_uuid: item.business_info_uuid.uuid,
  //           item_uuid: item.item_uuid.uuid,
  //           item_name: item.item_name,
  //           balance: item.balance,
  //           group_uuid: item.group_uuid.uuid,
  //           status: item.status,
  //           blocked_at: item.blocked_at,
  //           cancelled_at: item.cancelled_at,
  //           block_reason: item.block_reason,
  //           cancel_reason: item.cancel_reason,
  //           grace_period_end_date: item.grace_period_end_date,
  //           updated_at: item.updated_at,
  //         }
  //       })
  //     )
  //   ]);
  // }

  async createUserInfoAndEmployee(data: AppUserInfoEntity, employeeItem: AppUserItemEntity[]): Promise<AppUserInfoEntity> {
    const [user, employee, empleeItem] = await prismaClient.$transaction([
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
          is_employee: data.is_employee,
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
      }),
      ...employeeItem.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      ),
      prismaClient.userItem.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          item_uuid: data.debit_benefit_uuid.uuid,
          item_name: "Correct",
          balance: 0,
          status: "active",
          created_at: newDateF(new Date()),
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

  async updateEmployeeByCSV(data: AppUserInfoEntity, employeeData: any, employeeItem: AppUserItemEntity[]): Promise<void> {

    await prismaClient.$transaction([
      prismaClient.userInfo.update({
        where: {
          document: data.document
        },
        data: {
          is_employee: data.is_employee,
          updated_at: data.updated_at
        },

      }),
      prismaClient.employee.update({
        where: {
          uuid: employeeData.uuid
        },
        data: {
          user_info_uuid: employeeData.uuid.uuid,
          business_info_uuid: employeeData.business_info_uuid.uuid,
          company_internal_code: employeeData.internal_company_code,
          salary: employeeData.salary,
          job_title: employeeData.function,
          company_owner: employeeData.company_owner,
          dependents_quantity: employeeData.dependents_quantity,
          updated_at: employeeData.updated_at
        }
      }),
      ...employeeItem.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      )

    ])


  }
  async createUserInfoandUpdateUserAuthByCSV(data: AppUserInfoEntity, employeeItemEntity: AppUserItemEntity[]) {
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
          is_employee: data.is_employee,
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
      }),
      ...employeeItemEntity.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      ),
      prismaClient.userItem.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: data.uuid.uuid,
          item_uuid: data.debit_benefit_uuid.uuid,
          item_name: "Correct",
          balance: 0,
          status: "active",
          created_at: newDateF(new Date()),
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

  async createEmployeeAndItems(employeeInfoEntity: AppUserInfoEntity, employeeItemEntity: AppUserItemEntity[]): Promise<any> {
    const [employee, employeeItems, userInfo] = await prismaClient.$transaction([
      prismaClient.employee.create({
        data: {
          uuid: randomUUID(),
          user_info_uuid: employeeInfoEntity.uuid.uuid,
          business_info_uuid: employeeInfoEntity.business_info_uuid.uuid,
          company_internal_code: employeeInfoEntity.internal_company_code,
          salary: employeeInfoEntity.salary,
          dependents_quantity: employeeInfoEntity.dependents_quantity,
          job_title: employeeInfoEntity.function,
          company_owner: employeeInfoEntity.company_owner,
          created_at: employeeInfoEntity.created_at
        },

      }),
      ...employeeItemEntity.map((item) =>
        prismaClient.userItem.upsert({
          where: {
            uuid: item.uuid.uuid
          },
          create: {
            uuid: item.uuid.uuid,
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            created_at: item.created_at,
          },
          update: {
            user_info_uuid: item.user_info_uuid.uuid,
            business_info_uuid: item.business_info_uuid.uuid,
            item_uuid: item.item_uuid.uuid,
            item_name: item.item_name,
            balance: item.balance,
            group_uuid: item.group_uuid.uuid,
            status: item.status,
            blocked_at: item.blocked_at,
            cancelled_at: item.cancelled_at,
            block_reason: item.block_reason,
            cancel_reason: item.cancel_reason,
            grace_period_end_date: item.grace_period_end_date,
            updated_at: item.updated_at,
          }
        })
      ),

      prismaClient.userInfo.update({
        where: {
          uuid: employeeInfoEntity.uuid.uuid
        },
        data: {
          is_employee: true,
          updated_at: employeeInfoEntity.updated_at
        }
      })
    ])

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
    await prismaClient.$transaction(async (tx) => {
      const existingUserInfo = await tx.userInfo.findUnique({
        where: {
          document: data.document,
        },
      });

      // 2. Verifica se o usuário já existe
      if (existingUserInfo) {
        // --- CASO UPDATE ---
        // O usuário já existe, então apenas atualizamos as informações necessárias.
        // Não criamos um novo userItem aqui.
        await tx.userInfo.update({
          where: {
            document: data.document, // ou existingUserInfo.uuid se preferir e tiver o ID
          },
          data: {
            // Atualize os campos conforme a lógica original do 'update' do upsert
            is_employee: data.is_employee,
            updated_at: newDateF(new Date()), // Use sua função helper ou new Date()
            // Adicione outros campos que precisam ser atualizados, se houver
          },
        });
      } else {
        // --- CASO CREATE ---
        // O usuário não existe, então criamos o userInfo E o userItem.
        // Estas duas operações ocorrerão juntas dentro da transação.

        // Cria o userInfo
        await tx.userInfo.create({
          data: {
            uuid: data.uuid.uuid,
            document: data.document,
            document2: data.document2,
            document3: data.document3,
            phone: data.phone,
            full_name: data.full_name,
            email: data.email,
            gender: data.gender,
            date_of_birth: data.date_of_birth,
            marital_status: data.marital_status,
            is_employee: data.is_employee, // Vem do 'create' original
            created_at: data.created_at ?? newDateF(new Date()), // Use o valor fornecido ou um novo
          },
        });

        // Cria o userItem associado
        await tx.userItem.create({
          data: {
            uuid: randomUUID(), // Gera um novo UUID para o userItem
            user_info_uuid: data.uuid.uuid, // Associa ao userInfo recém-criado
            item_uuid: data.debit_benefit_uuid.uuid, // Usa o UUID do benefício/débito passado
            item_name: 'Correct', // Valor fixo conforme a regra
            balance: 0, // Valor fixo conforme a regra
            status: 'active', // Valor fixo conforme a regra
            created_at: newDateF(new Date()), // Use sua função helper ou new Date()
          },
        });
      }
    });
  }

  // async createOrUpdateUserInfoByEmployer(data: AppUserInfoEntity): Promise<void> {
  //   await prismaClient.userInfo.upsert({
  //     where: {
  //       document: data.document
  //     },
  //     create: {
  //       uuid: data.uuid.uuid,
  //       document: data.document,
  //       document2: data.document2,
  //       document3: data.document3,
  //       phone: data.phone,
  //       full_name: data.full_name,
  //       email: data.email,
  //       gender: data.gender,
  //       date_of_birth: data.date_of_birth,
  //       marital_status: data.marital_status,
  //       is_employee: data.is_employee,
  //       created_at: data.created_at
  //     },
  //     update: {
  //       is_employee: data.is_employee,
  //       updated_at: newDateF(new Date())
  //     }
  //   });
  // }

}
