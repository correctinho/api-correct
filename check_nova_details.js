require('dotenv').config({ path: '/home/jseren/syscorrect/api-correct/.env' });
const { BedrockClient, GetFoundationModelCommand } = require('@aws-sdk/client-bedrock');

async function test() {
  const client = new BedrockClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const models = ['amazon.nova-2-5-sonic', 'amazon.nova-lite-v1:0', 'amazon.nova-micro-v1:0'];
  for (const m of models) {
    try {
      const res = await client.send(new GetFoundationModelCommand({ modelIdentifier: m }));
      console.log('Model details for', m, ':', {
        modelArn: res.modelDetails?.modelArn,
        modelId: res.modelDetails?.modelId,
        inputModalities: res.modelDetails?.inputModalities,
        outputModalities: res.modelDetails?.outputModalities,
        inferenceTypesSupported: res.modelDetails?.inferenceTypesSupported,
      });
    } catch (e) {
      console.log('Failed for', m, ':', e.name, e.message);
    }
  }
}

test();
