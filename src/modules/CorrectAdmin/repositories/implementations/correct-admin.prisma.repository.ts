import { randomUUID } from "node:crypto";
import { Uuid } from "../../../../@shared/ValueObjects/uuid.vo";
import { prismaClient } from "../../../../infra/databases/prisma.config";
import { OutputFindAdminAuthDTO, OutputFindAdminDTO } from "../../correct-dto/correct.dto";
import { CorrectAdminEntity } from "../../entities/correct-admin.entity";
import { ICorrectAdminRepository } from "../correct-admin.repository";
import { newDateF } from "../../../../utils/date";



export class CorrectAdminPrismaRepository implements ICorrectAdminRepository {
    async create(data: CorrectAdminEntity): Promise<void> {
      const [correctAdmin, correctAccount] = await prismaClient.$transaction([
        prismaClient.correctAdmin.create({
            data: {
                name: data.name,
                email: data.email,
                userName: data.userName,
                password: data.password,
                isAdmin: data.isAdmin,

            }
        }),
        prismaClient.correctAccount.create({
          data:{
            uuid: randomUUID(),
            balance: 0,
            status:'active',
            created_at: newDateF(new Date())
          }
        })
      ])
    }

    async update(data: CorrectAdminEntity): Promise<void> {
        await prismaClient.correctAdmin.update({
            where: {
                uuid: data.uuid.uuid
            },
            data: {
                name: data.name,
                email: data.email,
                userName: data.userName,
            }
        })
    }
    async find(id: Uuid): Promise<OutputFindAdminDTO | null> {

        const admin = await prismaClient.correctAdmin.findUnique({
            where: {
                uuid: id.uuid
            }
        })

        if(!admin) return null

        return {
            uuid: new Uuid(admin.uuid),
            name: admin.name,
            email: admin.email,
            userName: admin.userName,
            isAdmin: admin.isAdmin
        }
    }
    findAll(): Promise<CorrectAdminEntity[]> {
        throw new Error("Method not implemented.");
    }

    async findByUserName(userName: string): Promise<OutputFindAdminDTO | null> {
        const admin = await prismaClient.correctAdmin.findUnique({
            where: {
                userName: userName
            }
        })


        if (!admin) {
            return null;
        }

        return {
            uuid: new Uuid(admin.uuid),
            name: admin.name,
            email: admin.email,
            userName: admin.userName,
            isAdmin: admin.isAdmin
        }
    }

    async findByUserNameAuth(userName: string): Promise<CorrectAdminEntity | null> {
        const admin = await prismaClient.correctAdmin.findUnique({
            where: {
                userName: userName
            }
        })

        if(!admin) return null

        return {
            uuid: new Uuid(admin.uuid),
            name: admin.name,
            email: admin.email,
            password: admin.password,
            userName: admin.userName,
            isAdmin: admin.isAdmin
        } as CorrectAdminEntity
    }

}
