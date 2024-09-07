import * as dotenv from 'dotenv';
import { SQS } from '@aws-sdk/client-sqs'

dotenv.config()

async function awsSQSConsumer(sqs: any, queueUrl: any){
  while(true){
    try{
      const { messages } = await sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessage: 1,
        WaitTimeSeconds: 10
      })
      if(!messages) continue

    }catch(err: any){
      console.log({err})
    }
  }
}

(async () => {

  const sqs = new SQS({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    }
  })

  const response = await awsSQSConsumer(sqs, process.env.QUEUE_URL)
  console.log("CONSUMER: ", response)

})
