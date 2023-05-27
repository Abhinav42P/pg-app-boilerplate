import { ApolloClient, HttpLink, InMemoryCache, ApolloLink } from "@apollo/client";
import redisClient from './redis-client';
import dotenv from "dotenv";
dotenv.config();
const { SHOP, SHOPIFY_API_VERSION } = process.env;



export const createClient = async (shop=SHOP, accessToken) => {

  var accessToken =   await redisClient.get('API_TOKEN');


  const addExtensionsLink = new ApolloLink((operation, forward) => {
    return forward(operation).map(response => {
      if(response.data){
        response.data.extensions = response.extensions;
      }
      return response;
    }); 
  });

  const httpLink = new HttpLink({
    uri: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "User-Agent": `shopify-app-node ${
        process.env.npm_package_version
      } | Shopify App CLI`
    },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: addExtensionsLink.concat(httpLink),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
    }
  });  
}