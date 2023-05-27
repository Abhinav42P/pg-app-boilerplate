const productService = require("../services/product-service");

const responseHandler = require("./response-handler");

const productController = {
  /**
   * Inits controller.
   *
   * @since 1.0.0
   * @return {object} productController
   */
  init: function() {
    this.responseHandler = Object.create(responseHandler).init();
    return this;
  },


  /**
    * Returns the products
    *
    * @since 1.0.0
    * @param {object} ctx context object
    * @param {object} next koa next callback
    * @return {object} productController
    */
   getProductById: async function(ctx, next) {
    var productId = ctx.request.query.productId ? ctx.request.query.productId : '',
    product;

    try {
      if (productId) {
        product = await productService
        .getProductById(productId);
      }
    } catch (error) {
      this.responseHandler.onError(ctx)(error);
    }


    if (product) {
      this.responseHandler.objectFound(ctx, { data: { product } });
    } else {
      this.responseHandler.onError(ctx)({ message: this.responseHandler.graphQlErrorMessage });
    }
    return this;
  },


  /**
  * Returns the products
  *
  * @since 1.0.0
  * @param {object} ctx context object
  * @param {object} next koa next callback
  * @return {object} productController
  */
  getProducts: async function(ctx, next) {
    const nProducts = 20;
    var cursor = ctx && ctx.request.query.cursor ? ctx.request.query.cursor : '',
    products;

    try {

      products = await productService
        .getProducts(nProducts, cursor);

    } catch (error) {
      this.responseHandler.onError(ctx)(error);
    }


    if (products) {
      this.responseHandler.objectFound(ctx, { data: { products: products } });
    } else {
      this.responseHandler.onError(ctx)({ message: this.responseHandler.graphQlErrorMessage });
    }
    return this;
  },

};

module.exports = productController;
