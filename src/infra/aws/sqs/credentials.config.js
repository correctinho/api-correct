const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const credentialsConfig = {
  region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.AWS_SECRET,
      secretAccessKey: process.env.AWS_SECRET_KEY
    }
}

module.exports = { credentialsConfig }
