const fetch = require('node-fetch');
import dotenv from "dotenv";
import redisClient from './redis-client';
dotenv.config();
const { SHOP } = process.env;




export const fetchData = async (route, options) => {

  const restAPIBaseUrl = `https://${SHOP}/admin/api/2021-07`;
  var result, response;
  var token =   await redisClient.get('API_TOKEN');

  await fetch(restAPIBaseUrl + route, {
    headers:  {   
      'Content-Type': 'application/json',
      "X-Shopify-Access-Token": token,
      "User-Agent": `shopify-app-node ${
        process.env.npm_package_version
      } | Shopify App CLI`
    },
    ...options 
  }).then(res => {
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.status = res.status;
      throw error;
    } else {
      response = res.json();
    }
  }).catch(err => console.log(err));

  result = await response;

  return result;
}
