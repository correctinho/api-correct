import { BusinessStatus, BusinessTypeOptions } from "@prisma/client"
import { PartnerCategory, PartnerConfigEntity } from "../../../../PartnerConfig/entities/partner-config.entity"

export interface InputBusinessFirstRegisterDTO {
  line1: string
  line2: string
  line3: string | null
  postal_code: string
  neighborhood: string
  city: string
  state: string
  country: string
  address_fk_uuid: string
  fantasy_name: string
  corporate_reason: string | null
  document: string
  classification: string
  colaborators_number: number
  status: BusinessStatus
  phone_1: string
  phone_2: string | null
  business_type: BusinessTypeOptions
  email: string
  branches_uuid: string[]
  main_branch: string
  correct_user_uuid?: string
  partnerConfig: {
    main_branch: string,
    partner_category: string[]
    use_marketing: boolean,
    use_market_place: boolean
  }
}

export interface OutputBusinessFirstRegisterDTO {
  Address: {
    uuid: string;
    line1: string;
    line2: string;
    line3: string | null;
    postal_code: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    created_at: string;
  };
  BusinessInfo: {
    uuid: string;
    address_uuid: string;
    fantasy_name: string;
    corporate_reason: string | null;
    document: string;
    classification: string;
    colaborators_number: number;
    status: BusinessStatus;
    phone_1: string;
    phone_2: string | null;
    business_type: BusinessTypeOptions;
    email: string;
    created_at: string;
  };
  CorrectUserBusinessBranch: {
    uuid: string;
    business_info_uuid: string;
    correct_user_uuid: string;
    created_at: string;
  };
  PartnerConfig: {
    uuid: string;
    business_info_uuid: string;
    main_branch: string;
    partner_category: string[];
    items_uuid: string[];
    admin_tax: number;
    marketing_tax: number;
    use_marketing: boolean;
    market_place_tax: number;
    use_market_place: boolean;
    created_at: string;
  };
}
