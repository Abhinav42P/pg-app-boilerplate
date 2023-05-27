const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const HOST = JSON.stringify(process.env.HOST);
const SHOP = JSON.stringify(process.env.SHOP);

module.exports = {
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST:HOST, SHOP:SHOP };
    config.plugins.push(new webpack.DefinePlugin(env));

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};
