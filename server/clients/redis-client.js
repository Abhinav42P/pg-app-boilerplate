
import dotenv from "dotenv";
import {promisify} from 'util';
const Redis = require("ioredis");

dotenv.config();
const { REDISCLOUD_URL, REDIS_NAMESPACE } = process.env;

const redisClient  = {
  init: function() {
    
    //Warning: keyPrefix won't apply to commands like KEYS and SCAN that take patterns
    const client = new Redis( REDISCLOUD_URL, { keyPrefix: REDIS_NAMESPACE });
    
    client.on("error", function(error) {
      console.error(error);
    });

    this.getAsync   = promisify(client.get).bind(client),
    this.hgetAsync   = promisify(client.hget).bind(client),
    this.setAsync   = promisify(client.set).bind(client),
    this.hsetAsync   = promisify(client.hset).bind(client),
    this.delAsync   = promisify(client.del).bind(client),
    this.hdelAsync   = promisify(client.hdel).bind(client),
    this.setSession = this.setSession.bind(this);
    this.setJSON    = this.setJSON.bind(this);
    this.getJSON    = this.getJSON.bind(this);
    this.set        = this.set.bind(this);
    this.get        = this.get.bind(this);
    this.delete     = this.delete.bind(this);
  },

  setJSON: async function (key, value){
    try {
      return await this.setAsync(key, JSON.stringify(value));
    } catch (err) {
      throw new Error(err);
    }
  },

  hsetJSON: async function (namespace, key, value){
    try {
      return await this.hsetAsync(namespace, key, JSON.stringify(value));
    } catch (err) {
      throw new Error(err);
    }
  },


  setSession: async function (session){
    return await this.setJSON(session.id, session);
  },

  getJSON: async function (key){
    try {
      let reply = await this.getAsync(key);
      if (reply) {
        return JSON.parse(reply);
      } else {
        return undefined;
      }
    } catch (err) {
      throw new Error(err);
    }
  },

  hgetJSON: async function (namespace, key){
    try {
      let reply = await this.hgetAsync(namespace, key);
      if (reply) {
        return JSON.parse(reply);
      } else {
        return undefined;
      }
    } catch (err) {
      throw new Error(err);
    }
  },

  set: async function (key, value){
    try {
      return await this.setAsync(key, value);
    } catch (err) {
      throw new Error(err);
    }
  },

  get: async function (key){
    try {
      let reply = await this.getAsync(key);
      if (reply) {
        return reply;
      } else {
        return undefined;
      }
    } catch (err) {
      throw new Error(err);
    }
  },

  delete: async function (id){
    try {
      return await this.delAsync(id);
    } catch (err) {
      throw new Error(err);
    }
  },

  hdel: async function (namespace, key){
    try {
      return await this.hdelAsync(namespace, key);
    } catch (err) {
      throw new Error(err);
    }
  },
}


redisClient.init();

export default redisClient;
