import { SalesType } from "@prisma/client";
import { Uuid } from "../../../../../@shared/ValueObjects/uuid.vo";
import { CustomError } from "../../../../../errors/custom.error";
import { IBranchRepository } from "../../../../branch/repositories/branch.repository";
import { ICompanyDataRepository } from "../../../CompanyData/repositories/company-data.repository";
import { PartnerCategory, PartnerConfigEntity } from "../../entities/partner-config.entity";
import { IPartnerConfigRepository } from "../../repositories/partner-config.repository";
import { InputSetDefinitionsByBusinessAdmin, OutputSetDefinitionsByBusinessAdmin } from "./dto/set-definitions-by-business-admin.dto";
import { ICompanyAddressRepository } from "../../../CompanyAddress/repositories/company-address.repository";
import { CompanyAddressEntity } from "../../../CompanyAddress/entities/company-address.entity";
import { geocodeAddress } from "../../../../../utils/geocoder";

export class SetDefinitionsByBusinessAdminUsecase {
  constructor(
    private businessInfoRepository: ICompanyDataRepository,
    private branchInfoRepository: IBranchRepository,
    private partnerConfigRepository: IPartnerConfigRepository,
    private companyAddressRepository: ICompanyAddressRepository
  ) { }

  async execute(data: InputSetDefinitionsByBusinessAdmin): Promise<OutputSetDefinitionsByBusinessAdmin> {
    //This usecase is responsible for updating partner config by partner admin
    if (!data.business_info_uuid) throw new CustomError("Business Info uuid is required", 400)

    if (!data.description && !data.phone && !data.sales_type && !data.title && !data.dispatch_address) {
      //if it happens, it means that api was called without sending any info to be updated
      throw new CustomError("At least one field is required", 400)
    }
    //first we need to find partnerConfig with business info uuid
    const partnerConfig = await this.partnerConfigRepository.findByPartnerId(data.business_info_uuid)
    if (!partnerConfig) throw new CustomError("Partner Config not found", 404)

    //now lets call the entity class
    const entity = new PartnerConfigEntity(partnerConfig)

    //with the values that came from the client, we will set on the entity
    entity.changeTitle(data.title ? data.title : entity.title)
    entity.changePhone(data.phone ? data.phone : entity.phone)
    entity.changeDescription(data.description ? data.description : entity.description)
    entity.changeSalesType(data.sales_type ? data.sales_type as SalesType : entity.sales_type)

    if (data.dispatch_address) {
      const geo = await geocodeAddress(data.dispatch_address.line2, data.dispatch_address.line1, data.dispatch_address.postal_code);

      if (entity.dispatch_address_uuid) {
        const existingAddress = await this.companyAddressRepository.findById(entity.dispatch_address_uuid);
        if (existingAddress) {
          existingAddress.changeLine1(data.dispatch_address.line1);
          existingAddress.changeLine2(data.dispatch_address.line2);
          if (data.dispatch_address.line3) {
            existingAddress.changeLine3(data.dispatch_address.line3);
          } else {
            existingAddress.changeLine3('');
          }
          existingAddress.changeNeighborhood(data.dispatch_address.neighborhood);
          existingAddress.changePostalCode(data.dispatch_address.postal_code);
          if (data.dispatch_address.city) existingAddress.changeCity(data.dispatch_address.city);
          if (data.dispatch_address.state) existingAddress.changeState(data.dispatch_address.state);
          existingAddress.changeLatitude(geo.lat);
          existingAddress.changeLongitude(geo.long);

          await this.companyAddressRepository.update(existingAddress);
        }
      } else {
        const newAddress = await CompanyAddressEntity.create({
          line1: data.dispatch_address.line1,
          line2: data.dispatch_address.line2,
          line3: data.dispatch_address.line3 || null,
          neighborhood: data.dispatch_address.neighborhood,
          postal_code: data.dispatch_address.postal_code,
          city: data.dispatch_address.city || null,
          state: data.dispatch_address.state || null,
          country: "Brasil",
          latitude: geo.lat,
          longitude: geo.long
        });
        await this.companyAddressRepository.save(newAddress);
        entity.changeDispatchAddressUuid(newAddress.uuid);
      }
    }

    //now we need to update
    await this.partnerConfigRepository.update(entity)

    return {
      uuid: entity.uuid?.uuid || '',
      business_info_uuid: entity.business_info_uuid.uuid,
      title: entity.title,
      phone: entity.phone,
      description: entity.description,
      sales_type: entity.sales_type,
      dispatch_address_uuid: entity.dispatch_address_uuid,
      updated_at: entity.updated_at
    }
  }
}
