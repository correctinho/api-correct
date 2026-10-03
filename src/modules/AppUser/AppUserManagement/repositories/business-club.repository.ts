export interface IProgramDTO {
  uuid: string;
  name: string;
  type: string;
  img_url: string | null;
  status: 'OWNED' | 'AVAILABLE' | 'COMING_SOON';
}

export interface ISearchBusinessClubDTO {
  user_info_uuid: string;
  query?: string;
  lat?: number;
  lon?: number;
  program_uuid?: string;
  category?: string;
}

export interface IPartnerDetailsDTO {
  uuid: string;
  name: string;
  description: string;
  phone: string | null;
  use_marketing: boolean;
  address: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    latitude?: string;
    longitude?: string;
  } | null;
  products: {
    uuid: string;
    name: string;
    price: number;
    img_url: string | null;
  }[];
}

export interface IBusinessClubRepository {
  listHomePrograms(user_info_uuid: string): Promise<IProgramDTO[]>;
  searchBusinessClub(data: ISearchBusinessClubDTO): Promise<any[]>;
  getProgramBranches(program_uuid: string): Promise<{ uuid: string; name: string }[]>;
  getPartnerDetails(business_info_uuid: string): Promise<IPartnerDetailsDTO | null>;
}
