const { SendMessageCommand, SQSClient } = require('@aws-sdk/client-sqs')
const { credentialsConfig } = require('./credentials.config')
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const sqsclient = new SQSClient(credentialsConfig)
async function awsSendMessage(body){
  try{
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify(body),
      QueueUrl: process.env.QUEUE_URL,
    })

    const result = await sqsclient.send(command)
    console.group(result)
  }catch(err){
    console.log("sender error: ", err)
  }
}

module.exports = { awsSendMessage }
