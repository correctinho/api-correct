import { AppUserByUserEntity, IAuthAppUserProps } from "../../../entities/appuser-by-user.entity";
import { AppUserAuthResponse, IAppUserAuthRepository } from "../app-use-auth-repository";
import {randomUUID} from 'crypto'


export class AppUserAuthMemoryRepository implements IAppUserAuthRepository{
    

    items: AppUserByUserEntity[] = []

    async findByCPFAuth(cpf: string): Promise<AppUserByUserEntity | null> {
        return this.items.find(app_user => app_user.cpf === cpf) || null
    }

    async findByCPF(cpf: string): Promise<AppUserAuthResponse | null> {
        return this.items.find(app_user => app_user.cpf === cpf) || null
    }
    async findByemail(email: string): Promise<AppUserAuthResponse | null> {
        return this.items.find(app_user => app_user.email === email) || null
    }
   
    async findById(id: string): Promise<AppUserByUserEntity | null> {
        return this.items.find(app_user => app_user.id === id) || null
    }
    async saveNewUser(data: AppUserByUserEntity): Promise<AppUserAuthResponse> {
        this.items.push(data)
        return data
    }

    async saveRegisteredUser(data: AppUserByUserEntity): Promise<AppUserAuthResponse> {
        this.items.push(data)
        return {
            ...data,
            app_user_data_id: data.app_user_data_id
        }
    }

}