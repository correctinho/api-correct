const axios = require('axios');

async function main() {
  try {
    const res = await axios.get('http://localhost:3333/business/7c57e449-4caa-454d-aa4a-2ec1582feeae/contract');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response?.status, err.response?.data);
  }
}
main();
