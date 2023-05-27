import { gql } from "@apollo/client";
var graphQueries = require("./graph-queries");
var nestedProperty = require("nested-property");

var product = {

  /**
   * Gets product by id.
   *
   * @since 1.0.0
   * @param {string} productId id of the product.
   * @return {object} productData
   */
  getProductById: async function(productId) {
    var query = gql`{
      product(id:"${productId}") {
        id
        title
        tags
        handle
        images(first:1){
          edges{
            node{
              altText
              originalSrc
              height
              width
            }
          }
        }
        variants(first: 1){
          edges{
            node{
              id
              price
            }
          }
        }
      }
    }`;

    const result = await graphQueries
      .get(query);

    var productData ;

    if(!nestedProperty.has(result,'data.product.id')){
      throw new Error('Product not found');
    }

    productData = result.data.product;

    return productData;
  },


   /**
     * Fetches the details of n products.
     *
     * @since 1.0.0
     * @param {int} nProducts number of the products to fetch.
     * @param {string} cursor current cursor.
     * @return {array}
     */
    getProducts: async function(nProducts = 20, cursor) {
      const query = gql`
          query {
            products(
              first: ${nProducts},
              reverse: true,
              ${cursor && cursor.length ? `after:"${cursor},"` : ''}
            ) {
              edges{
                cursor
                node{
                  id
                  handle
                  title
                  requiresSellingPlan
                  status
                  images(first: 1){
                    edges{
                      node{
                        originalSrc
                        altText
                      }
                    }
                  }
                  sellingPlanGroups(first: 10){
                    edges{
                      node{
                        id
                        name
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasPreviousPage
                hasNextPage
              }
            }
          }
        `;

      const result = await graphQueries.get(query);

      var products;
      if (nestedProperty.has(result, 'data.products.edges')) {
        products = result.data.products.edges.map(edge=>{
          var node = edge.node;
          return node;
        });

        if(products[0]){
          products[0].cursor = result.data.products.edges.slice(-1)[0].cursor;
          products[0].pageInfo = result.data.products.pageInfo;
        }

      }
      return products;
    },

};

module.exports = product;
