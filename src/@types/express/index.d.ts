import * as express from 'express'

declare global {
  namespace Express {
    interface Request {
      correctAdmin: {
        correctAdminId: string,
        userName: string | null,
        email: string | null,
        isAdmin: boolean | null
      },
      companyUser : {
        companyUserId: string,
        businessInfoUuid: string,
        isAdmin: boolean,
        password: string,
        document: string | null,
        name: string | null,
        email: string | null,
        userName: string | null,
        function: string | null,
        permissions: string[],
        status: string,
        created_at: string,
        updated_at: string | null
      },
      appUser: {
        appUserId: string
        document: string,
        email:string,
        created_at: string,
        updated_at: string | null
        user_info_uuid: string | null
      }
    }
  }
}
