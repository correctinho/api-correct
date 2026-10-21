import { prismaClient } from "../../../../infra/databases/prisma.config";
import { BusinessContractDataProps } from "../../usecase/generate-business-contract/dto/generate-business-contract.dto";
import { IBusinessContractRepository } from "../business-contract.repository";

export class BusinessContractPrismaRepository implements IBusinessContractRepository {
    async findPendingByBusiness(business_info_uuid: string): Promise<{ uuid: string; rendered_html: string; status: string; } | null> {
        const contract = await prismaClient.businessContract.findFirst({
            where: {
                business_info_uuid: business_info_uuid,
                status: 'PENDING'
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
            include: {
                PartnerConfig: true,
                Address: true,
                BusinessinfoBranch: {
                    include: {
                        BranchInfo: {
                            include: {
                                BranchItem: {
                                    include: { Item: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!business || !business.PartnerConfig || business.PartnerConfig.length === 0) {
            return null;
        }

        const config = business.PartnerConfig[0];
        const admin_tax = config.pending_admin_tax !== null ? config.pending_admin_tax : config.admin_tax;
        const marketing_tax = config.pending_marketing_tax !== null ? config.pending_marketing_tax : config.marketing_tax;
        const market_place_tax = config.pending_market_place_tax !== null ? config.pending_market_place_tax : config.market_place_tax;

        const selectedItems = config.items_uuid || [];
        
        const allPrograms = await prismaClient.item.findMany({
            where: {
                item_category: 'pre_pago',
                item_type: 'programa'
            }
        });
        
        const mappedPrograms = allPrograms.map(p => ({
            uuid: p.uuid,
            name: p.name,
            checked: selectedItems.includes(p.uuid) ? 'X' : ' '
        }));

        return {
            uuid: business.uuid,
            contract_number: business.contract_number,
            corporate_reason: business.corporate_reason,
            fantasy_name: business.fantasy_name,
            document: business.document,
            legal_representative_name: business.legal_representative_name,
            legal_representative_cpf: business.legal_representative_cpf,
            address: business.Address ? {
                line1: business.Address.line1,
                line2: business.Address.line2,
                line3: business.Address.line3,
                neighborhood: business.Address.neighborhood,
                city: business.Address.city,
                state: business.Address.state,
                postal_code: business.Address.postal_code,
            } : null,
            use_marketing: config.use_marketing,
            use_market_place: config.use_market_place,
            use_correct_fidelity: config.use_correct_fidelity,
            admin_tax: admin_tax || 0,
            marketing_tax: marketing_tax || 0,
            market_place_tax: market_place_tax || 0,
            programs: mappedPrograms
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

        // Limpa possíveis contratos pendentes anteriores para evitar duplicidade
        await prismaClient.businessContract.deleteMany({
            where: {
                business_info_uuid: data.business_info_uuid,
                status: 'PENDING'
            }
        });

        const contract = await prismaClient.businessContract.create({
            data: {
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

    async findByBusinessId(business_info_uuid: string): Promise<any | null> {
        // Prefer pending contracts if available, otherwise latest signed
        const pendingContract = await prismaClient.businessContract.findFirst({
            where: { business_info_uuid, status: 'PENDING' },
            orderBy: { created_at: 'desc' }
        });

        if (pendingContract) return pendingContract;

        return await prismaClient.businessContract.findFirst({
            where: { business_info_uuid, status: 'SIGNED' },
            orderBy: { created_at: 'desc' }
        });
    }

    async deleteByBusinessId(business_info_uuid: string): Promise<void> {
        await prismaClient.businessContract.deleteMany({
            where: { business_info_uuid }
        });
    }

    async updateStatus(business_info_uuid: string, status: string): Promise<void> {
        if (status === 'SIGNED') {
            await this.signPendingContract(business_info_uuid);
        } else {
            // Default generic fallback just in case
            const latest = await prismaClient.businessContract.findFirst({
                where: { business_info_uuid },
                orderBy: { created_at: 'desc' }
            });
            if (latest) {
                await prismaClient.businessContract.update({
                    where: { uuid: latest.uuid },
                    data: { status: status as any }
                });
            }
        }
    }

    // O Gatilho Diferido!
    async signPendingContract(business_info_uuid: string): Promise<void> {
        await prismaClient.$transaction(async (tx) => {
            // 1. Encontra o contrato pendente
            const pendingContract = await tx.businessContract.findFirst({
                where: { business_info_uuid, status: 'PENDING' }
            });

            if (!pendingContract) {
                throw new Error("No pending contract found to sign.");
            }

            // 2. Arquiva todos os contratos assinados anteriores
            await tx.businessContract.updateMany({
                where: { business_info_uuid, status: 'SIGNED' },
                data: { status: 'ARCHIVED' }
            });

            // 3. Promove o contrato pendente para assinado
            await tx.businessContract.update({
                where: { uuid: pendingContract.uuid },
                data: { 
                    status: 'SIGNED',
                    signed_at: new Date()
                }
            });

            // 4. Copia as taxas pendentes para as ativas no PartnerConfig
            const partnerConfig = await tx.partnerConfig.findUnique({
                where: { business_info_uuid }
            });

            if (partnerConfig) {
                await tx.partnerConfig.update({
                    where: { uuid: partnerConfig.uuid },
                    data: {
                        admin_tax: partnerConfig.pending_admin_tax !== null ? partnerConfig.pending_admin_tax : partnerConfig.admin_tax,
                        marketing_tax: partnerConfig.pending_marketing_tax !== null ? partnerConfig.pending_marketing_tax : partnerConfig.marketing_tax,
                        market_place_tax: partnerConfig.pending_market_place_tax !== null ? partnerConfig.pending_market_place_tax : partnerConfig.market_place_tax,
                        use_marketing: partnerConfig.pending_use_marketing !== null ? partnerConfig.pending_use_marketing : partnerConfig.use_marketing,
                        use_market_place: partnerConfig.pending_use_market_place !== null ? partnerConfig.pending_use_market_place : partnerConfig.use_market_place,
                        
                        // Limpa os campos pendentes
                        pending_admin_tax: null,
                        pending_marketing_tax: null,
                        pending_use_marketing: null,
                        pending_market_place_tax: null,
                        pending_use_market_place: null
                    }
                });
            }
        });
    }
}
