export interface IGetEmployerDetailsRepository {
  findEmployerDetails(uuid: string): Promise<any>;
}
