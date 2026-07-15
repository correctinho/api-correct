import { prismaClient } from "../../../../infra/databases/prisma.config";
import { BusinessContractDataProps } from "../../usecase/generate-business-contract/dto/generate-business-contract.dto";
import { IBusinessContractRepository } from "../business-contract.repository";

export class BusinessContractPrismaRepository implements IBusinessContractRepository {
    async findPendingByBusiness(business_info_uuid: string): Promise<{ uuid: string; rendered_html: string; status: string; } | null> {
        const contract = await prismaClient.businessContract.findUnique({
            where: {
                business_info_uuid: business_info_uuid,
            },
            select: {
                uuid: true,
                rendered_html: true,
                status: true,
            }
        });

        if (!contract) {
            return null;
        }

        return {
            uuid: contract.uuid,
            rendered_html: contract.rendered_html,
            status: contract.status.toString(),
        };
    }


    async getBusinessData(business_info_uuid: string): Promise<BusinessContractDataProps | null> {
        const business = await prismaClient.businessInfo.findUnique({
            where: { uuid: business_info_uuid },
            // Assumindo que as taxas ficam na configuração do parceiro. 
            // Ajuste o nome "partnerConfig" conforme o seu schema real.
            include: {
                PartnerConfig: true
            }
        });

        if (!business) {
            return null;
        }

        return {
            uuid: business.uuid,
            corporate_reason: business.corporate_reason,
            fantasy_name: business.fantasy_name,
            document: business.document,
            admin_tax: business.PartnerConfig[0].admin_tax || 0,
            marketing_tax: business.PartnerConfig[0].marketing_tax || 0,
            market_place_tax: business.PartnerConfig[0].market_place_tax || 0,
        };
    }

    async getActiveB2BTerm(): Promise<{ uuid: string; content: string } | null> {
        const term = await prismaClient.termsOfService.findFirst({
            where: {
                type: 'B2B_BUSINESS_MSA',
                is_active: true,
            },
        });

        if (!term) {
            return null;
        }

        return {
            uuid: term.uuid,
            content: term.content,
        };
    }

    async savePendingContract(data: {
        business_info_uuid: string;
        terms_uuid: string;
        rendered_html: string;
        status: 'PENDING';
    }): Promise<{ uuid: string; status: string }> {

        // Usamos upsert para o caso do Admin clicar duas vezes em "Gerar Contrato"
        // Assim não quebramos a constraint de @unique no business_info_uuid
        const contract = await prismaClient.businessContract.upsert({
            where: {
                business_info_uuid: data.business_info_uuid,
            },
            update: {
                terms_uuid: data.terms_uuid,
                rendered_html: data.rendered_html,
                status: data.status,
            },
            create: {
                business_info_uuid: data.business_info_uuid,
                terms_uuid: data.terms_uuid,
                rendered_html: data.rendered_html,
                status: data.status,
            },
        });

        return {
            uuid: contract.uuid,
            status: contract.status,
        };
    }
}