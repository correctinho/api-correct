import { BusinessTypeOptions, Permissions, Status } from "@prisma/client"
import { CompanyDataEntity } from "../../CompanyData/entities/company-data.entity"

export type BusinessUserResponse = {
    uuid: string
    business_info_uuid: string
    is_admin: boolean
    document: string | null
    name: string | null
    email: string | null
    user_name: string | null
    function: string | null
    permissions: Permissions[]
    status: Status
    
}