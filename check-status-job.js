const axios = require('axios');

require('dotenv').config();

(async () => {
  try {
    axios.post(`${process.env.SERVER_URL}/check-blog-status`).then((r) => r.status);
  } catch (error) {
    console.log('erro ao executar o job', error);
  }
})();
