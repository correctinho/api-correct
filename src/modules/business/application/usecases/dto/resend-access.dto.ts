export interface ResendAccessInputDto {
  uuid: string; // business_info_uuid
}

export interface ResendAccessRepoInputDto {
  uuid: string;
  new_password_hash: string;
}

export interface ResendAccessRepoOutputDto {
  success: boolean;
  message: string;
  admin_email: string;
  name: string;
}

export interface ResendAccessOutputDto {
  success: boolean;
  message: string;
  temporary_password?: string;
  admin_email: string;
}
