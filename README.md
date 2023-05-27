[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
---

# Boiler plate app for shopify stores

### Built With

* [Node.js](http://nodejs.org/)
* [Koa](https://koajs.com/)
* [Shopify node api - 2021-07](https://github.com/Shopify/shopify-node-api)
* [Next Js](https://nextjs.org/)
* [Polaris](https://polaris.shopify.com/)
* [Apollo Client](https://github.com/apollographql/apollo-client)


## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.
* npm
  ```sh
  npm install npm@latest -g
  ```

1. You can use cloudflared(https://github.com/cloudflare/cloudflared) tunnel to serve the app. 
2. Add .env file to assign proxy url and credentials, 
3. Configure urls in Shopify App dashboard.
4. Request the permissions for 'read_own_subscription_contracts, write_own_subscription_contracts'.




<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.
