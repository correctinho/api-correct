import { BusinessTypeOptions, Permissions, Status } from "@prisma/client"

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
    created_at: string
    updated_at: string

}
