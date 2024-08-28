import { api } from "../../../infra/axios/axios.config";
<<<<<<< HEAD
=======
import * as dotenv from 'dotenv';

dotenv.config()
>>>>>>> 1349532d9232e0df6fe0a7276f9c5722273747de

const baseUrl = process.env.MS_NOTIFICATION_BASEURL as string
const receiver1 = process.env.NEW_BUSINESS_NOTIFICATION_RECEIVER_1 as string
const receiver2 = process.env.NEW_BUSINESS_NOTIFICATION_RECEIVER_2 as string

export class NewBusinessNotification {

  async notififyCorrectAdmin(data: any){
    try{
       await api.post(`${baseUrl}/new-business`, {
        business_email: data.business_email,
        document: data.document,
        fantasy_name: data.fantasy_name,
        corporate_reason: data.corporate_reason,
        receivers_email: [receiver1, receiver2]
      })


    }catch(err: any){
<<<<<<< HEAD
=======
      console.log({err})
>>>>>>> 1349532d9232e0df6fe0a7276f9c5722273747de
    }
  }
}
