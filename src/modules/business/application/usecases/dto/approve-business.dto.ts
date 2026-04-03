export interface ApproveBusinessInputDto {
  uuid: string;
  admin_email: string;
}

export interface ApproveBusinessRepoInputDto {
  uuid: string;
  admin_email: string;
  password_hash: string;
}

export interface ApproveBusinessOutputDto {
  success: boolean;
  message: string;
  temporary_password?: string;
}
