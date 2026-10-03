import { Prisma } from '@prisma/client';
import { prismaClient } from '../../../../../infra/databases/prisma.config';
import { IBusinessClubRepository, IProgramDTO, ISearchBusinessClubDTO } from '../business-club.repository';

export class PrismaBusinessClubRepository implements IBusinessClubRepository {
  async listHomePrograms(user_info_uuid: string): Promise<IProgramDTO[]> {
    // Busca os itens que são programas
    const programs = await prismaClient.item.findMany({
      where: { item_type: 'programa' }
    });

    // Busca configurações de parceiros ativos para verificar quais programas possuem parceiros
    const activePartnerConfigs = await prismaClient.partnerConfig.findMany({
      where: {
        BusinessInfo: { status: 'active' }
      },
      select: { items_uuid: true }
    });

    const availableProgramUuids = new Set<string>();
    for (const pc of activePartnerConfigs) {
      if (pc.items_uuid && Array.isArray(pc.items_uuid)) {
        for (const uuid of pc.items_uuid) {
          availableProgramUuids.add(uuid);
        }
      }
    }

    // Busca os programas que o usuário já possui
    const userItems = await prismaClient.userItem.findMany({
      where: { user_info_uuid },
      select: { item_uuid: true }
    });

    const ownedItemUuids = userItems.map(ui => ui.item_uuid);

    // Mapeia e formata os programas
    const formattedPrograms: IProgramDTO[] = programs.map(program => {
      let status: 'OWNED' | 'AVAILABLE' | 'COMING_SOON' = 'COMING_SOON';

      if (ownedItemUuids.includes(program.uuid)) {
        status = 'OWNED';
      } else if (availableProgramUuids.has(program.uuid)) {
        // Se não possui, mas tem ramo/parceiro vinculado ativo, está disponível para compra
        status = 'AVAILABLE';
      }

      return {
        uuid: program.uuid,
        name: program.name,
        type: program.item_type,
        img_url: program.img_url,
        status
      };
    });

    // Ordenação: OWNED > AVAILABLE > COMING_SOON
    const statusPriority = { 'OWNED': 1, 'AVAILABLE': 2, 'COMING_SOON': 3 };
    return formattedPrograms.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
  }

  async searchBusinessClub({ query = '', lat, lon, program_uuid, category }: ISearchBusinessClubDTO): Promise<any[]> {
    const searchTerm = `%${query}%`;
    const conditions = [];

    // Filtra apenas empresas ativas
    conditions.push(Prisma.sql`bi.status::text = 'active'`);

    conditions.push(Prisma.sql`(
      pc.title ILIKE ${searchTerm} OR 
      pc.description ILIKE ${searchTerm} OR 
      bi.corporate_reason ILIKE ${searchTerm}
    )`);

    if (program_uuid) {
      conditions.push(Prisma.sql`${program_uuid} = ANY(pc.items_uuid)`);
    }

    if (category) {
      // Filtrar array string no postgres: text = ANY(array)
      conditions.push(Prisma.sql`(pc.main_branch = ${category} OR ${category} = ANY(pc.partner_category))`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;

    const joinClause = Prisma.empty;

    if (lat !== undefined && lon !== undefined) {
      const partners = await prismaClient.$queryRaw`
        SELECT 
          bi.uuid as business_info_uuid,
          bi.corporate_reason,
          COALESCE(pc.title, bi.fantasy_name, bi.corporate_reason) AS vitrine_title,
          COALESCE(pc.description, '') AS vitrine_description,
          CASE 
            WHEN addr.latitude IS NOT NULL AND addr.longitude IS NOT NULL THEN
              (6371 * acos(
                cos(radians(${lat})) * cos(radians(CAST(addr.latitude AS FLOAT))) * cos(radians(CAST(addr.longitude AS FLOAT)) - radians(${lon})) + 
                sin(radians(${lat})) * sin(radians(CAST(addr.latitude AS FLOAT)))
              ))
            ELSE NULL
          END AS distance
        FROM "business_data" bi
        INNER JOIN "partner_config" pc ON pc.business_info_uuid = bi.uuid
        LEFT JOIN "addresses" addr ON addr.uuid = pc.dispatch_address_uuid
        ${joinClause}
        ${whereClause}
        ORDER BY distance ASC NULLS LAST, pc.title ASC
      `;
      return partners as any[];
    } else {
      const partners = await prismaClient.$queryRaw`
        SELECT 
          bi.uuid as business_info_uuid,
          bi.corporate_reason,
          COALESCE(pc.title, bi.fantasy_name, bi.corporate_reason) AS vitrine_title,
          COALESCE(pc.description, '') AS vitrine_description,
          NULL as distance
        FROM "business_data" bi
        INNER JOIN "partner_config" pc ON pc.business_info_uuid = bi.uuid
        ${joinClause}
        ${whereClause}
        ORDER BY pc.title ASC
      `;
      return partners as any[];
    }
  }

  async getProgramBranches(program_uuid: string): Promise<{ uuid: string; name: string }[]> {
    const partnerConfigs = await prismaClient.partnerConfig.findMany({
      where: { 
        items_uuid: { has: program_uuid },
        BusinessInfo: {
          status: 'active'
        }
      },
      select: {
        main_branch: true,
        partner_category: true,
      }
    });

    const rawBranchesSet = new Set<string>();

    for (const config of partnerConfigs) {
      if (config.main_branch) {
        rawBranchesSet.add(config.main_branch);
      }
      if (config.partner_category && Array.isArray(config.partner_category)) {
        for (const cat of config.partner_category) {
          if (cat) rawBranchesSet.add(cat);
        }
      }
    }

    const rawBranches = Array.from(rawBranchesSet);
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    
    const branchUuids = rawBranches.filter(b => uuidRegex.test(b));
    const finalBranches: { uuid: string; name: string }[] = [];

    if (branchUuids.length > 0) {
      const branchInfos = await prismaClient.branchInfo.findMany({
        where: { uuid: { in: branchUuids } },
        select: { uuid: true, name: true }
      });
      
      for (const info of branchInfos) {
        if (info.name) {
          finalBranches.push({ uuid: info.uuid, name: info.name });
        }
      }
    }

    return finalBranches.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPartnerDetails(business_info_uuid: string) {
    const businessData = await prismaClient.businessInfo.findUnique({
      where: { uuid: business_info_uuid, status: 'active' },
      include: {
        PartnerConfig: {
          include: {
            DispatchAddress: true
          }
        },
        Address: true,
      }
    });

    if (!businessData || !businessData.PartnerConfig || businessData.PartnerConfig.length === 0) {
      return null;
    }

    const partnerConfig = businessData.PartnerConfig[0];

    const name = partnerConfig.title || businessData.fantasy_name || businessData.corporate_reason;
    const description = partnerConfig.description || '';
    const phone = partnerConfig.phone || businessData.phone_1 || null;
    const use_marketing = partnerConfig.use_marketing || false;
    
    const addressData = partnerConfig.DispatchAddress || businessData.Address;
    const address = addressData ? {
      street: (addressData as any).line1 || undefined,
      number: (addressData as any).line2 || undefined,
      neighborhood: addressData.neighborhood || undefined,
      city: addressData.city || undefined,
      state: addressData.state || undefined,
      postal_code: addressData.postal_code || undefined,
      latitude: addressData.latitude !== null && addressData.latitude !== undefined ? String(addressData.latitude) : undefined,
      longitude: addressData.longitude !== null && addressData.longitude !== undefined ? String(addressData.longitude) : undefined,
    } : null;

    let products: any[] = [];
    if (use_marketing) {
      const dbProducts = await prismaClient.products.findMany({
        where: {
          business_info_uuid,
          is_active: true,
          deleted_at: null
        },
        select: {
          uuid: true,
          name: true,
          promotional_price: true,
          original_price: true,
          image_urls: true
        }
      });

      products = dbProducts.map(p => {
        // Look for medium.webp, fallback to thumb, then large, then the first one
        let img = null;
        if (p.image_urls && p.image_urls.length > 0) {
          img = p.image_urls.find(url => url.endsWith('medium.webp')) || 
                p.image_urls.find(url => url.endsWith('thumb.webp')) || 
                p.image_urls.find(url => url.endsWith('large.webp')) || 
                p.image_urls[0];
        }

        return {
          uuid: p.uuid,
          name: p.name,
          price: p.promotional_price > 0 ? p.promotional_price : p.original_price,
          img_url: img
        };
      });
    }

    return {
      uuid: business_info_uuid,
      name,
      description,
      phone,
      use_marketing,
      address,
      products
    };
  }
}
