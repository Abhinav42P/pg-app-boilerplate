import Router from "koa-router";
import { verifyRequest } from "@shopify/koa-shopify-auth";
import dotenv from "dotenv";
dotenv.config();
const dev = process.env.NODE_ENV !== "production";

const productController = require("../controller/product-controller");
const bodyParser = require('koa-bodyparser');
const router = new Router();

if(!dev){
  router.use(verifyRequest({ accessMode: "offline" }));
}

router.use(bodyParser());


router.get("/get-products", async (ctx, next) => {
  await Object.create(productController).init().getProducts(ctx, next);
});

router.get("/get-product", async (ctx, next) => {
  await Object.create(productController).init().getProductById(ctx, next);
});



module.exports = router;
