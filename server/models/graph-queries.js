import { createClient } from "../clients/graph-client";

import { gql } from "@apollo/client";
var nestedProperty = require("nested-property");
const deepmerge = require('deepmerge');

var https = require('https');

var graphQueries = {
  /**
   * Creates apollo client
   *
   * @since 1.0.0
   * @return {object} graphQueries
   */
  init: async function() {
    this.apolloClient = this.apolloClient || await this.refreshClient();
    return this;
  },


  /**
    * Checks for grapqhl user errors when mutating objects.
    *
    * @since 1.0.0
    * @param {object} query The original query
    * @param {object} result the graphql result
    * @return void
    */
  checkForMutationErrors: function(query, result) {
    query.definitions.forEach(definition => {
      var mutationResultBody = definition.name && result.data[definition.name.value];
      if (nestedProperty.has(mutationResultBody, 'userErrors.0')) {
        throw new Error('Mutation user errors: ' + JSON.stringify(mutationResultBody.userErrors));
      }
    });
  },

  /**
    * Refreshes access token
    *
    * @since 1.0.0
    * @return void
    */
  refreshClient: async function() {
    this.apolloClient = await createClient();
    return this.apolloClient;
  },

  /**
   * Fetches object.
   *
   * @since 1.0.0
   * @param {string} query graphql query string
   * @return {object}
   */
  get: async function(query) {

    if(!this.apolloClient){
      await this.refreshClient();
    }

    var queryResult;

    await this.apolloClient
    .query({ query })
    .then((result) => {
      queryResult = result;
    });

    //clone the result since apollo also has caching
    queryResult = queryResult && JSON.parse(JSON.stringify(queryResult));
    return queryResult;
  },

  /**
   * Mutates an object.
   *
   * @since 1.0.0
   * @param {string} query graphql query string
   * @param {object} variables the input object
   * @return {object}
   */
  create: async function(query, variables) {
    if(!this.apolloClient){
      await this.refreshClient();
    }

    var mutationResult;
    await this.apolloClient
      .query({ query, variables })
      .then((function (result) {
        this.checkForMutationErrors(query, result);
        return result;
      }).bind(this))
      .then((result) => {
        mutationResult = result;
      })

    return mutationResult;
  },

  /**
   * Fetches data using graphql bulk query.
   *
   * @since 1.0.0
   * @param {string} query graphql query string.
   * @return {object} subscriptionContracts
   */
  getBulkData: async function(query) {
    await this.queueBulkFetch(query);
    var currentPollCount = 20, bulkFetchResult;
    const pollInterval = 3000; //ms

    await new Promise(
      function (resolve, reject) {
        var intervalHandle = setInterval(
          async function () {
            try {
              var [bulkFetchStatus, bulkFetchUrl] = await this.pollBulkOperation();
            } catch (error) {
              reject(error);
              clearInterval(intervalHandle);
            }
            if (bulkFetchStatus === "RUNNING" && currentPollCount > 0) {
              currentPollCount--;
            } else if (bulkFetchStatus === "COMPLETED") {
              try {
                bulkFetchResult = await this.retrieveBulkDataFromUrl(bulkFetchUrl);
              } catch (error) {
                reject(error);
              }
              resolve();
              clearInterval(intervalHandle);
            } else {
              resolve();
              clearInterval(intervalHandle);
            }
          }.bind(this),
          pollInterval
        );
      }.bind(this)
    );

    // if (result instanceof Error) {
    //   throw result;
    // }
    return bulkFetchResult;
  },

  /**
   * Sends the fetch query for bulk operation.
   *
   * @since 1.0.0
   * @param {string} query graphql query string.
   * @return void
   */
  queueBulkFetch: async function(query) {
    var query = gql`
        mutation {
            bulkOperationRunQuery(
            query:"""
            {
                ${query}
            }
            """
        ) {
            bulkOperation {
                id
                status
            }
            userErrors {
                field
                message
            }
            }
        }
        `;

    const result = await this.get(query);
    if (!nestedProperty.has(result, 'data.bulkOperationRunQuery.bulkOperation.id')) {
      throw new Error('Bulk query failed :' + JSON.stringify(result));
    }
    return this;
  },

  /**
   * Polls the status bulk query operation.
   *
   * @since 1.0.0
   * @return void
   */
  pollBulkOperation: async function() {
    var bulkFetchStatus, bulkFetchUrl;
    var query = gql`
      {
        currentBulkOperation {
          id
          status
          errorCode
          completedAt
          objectCount
          url
        }
      }
    `;

    const result = await this.get(query);

    if (result && result.data.currentBulkOperation) {
      bulkFetchStatus = result.data.currentBulkOperation.status;
      bulkFetchUrl = result.data.currentBulkOperation.url;
    }

    if (bulkFetchStatus !== 'COMPLETED' && bulkFetchStatus !== 'RUNNING') {
      throw new Error('Bulk polling failed :' + JSON.stringify(result));
    }
    return [bulkFetchStatus, bulkFetchUrl];
  },

  /**
   * Retrieves data from remote url returned from bulk query.
   *
   * @since 1.0.0
   * @return {Array} contracts
   */
  retrieveBulkDataFromUrl: async function(bulkFetchUrl) {
    var rawString = "";
    var bulkFetchResult = [];

    await new Promise(function (resolve) {
      https.get(bulkFetchUrl, function (res) {
        res.on("data", (chunk) => {
          rawString = rawString + chunk;
        });
        res.on("end", function () {
          bulkFetchResult = JSON.parse("[" + rawString.split(/\n/).filter(str => str && str.length > 2).join(",") + "]");
          resolve();
        }.bind(this)
        );
      }.bind(this));
    }.bind(this)
    );

    return bulkFetchResult;
  },

  /**
  * Schedules batch mutations using setTimeout,
  * adjusts mutation batch count and request interval in way that Shopify graphql doesn't run out of queries.
  *
  * @since 1.0.0
  * @param {object} batchInputData input data.
  * @param {function} inputDataToQueryMapper maps the input data to mutation body.
  * @param {function} resolve callback to run once the current batch request is finished.
  * @param {function} config configuration for batch scheduling.
  * @return void
  */
  batchScheduleMutations: async function(
    batchInputData,
    inputDataToQueryMapper,
    resolve = null,
    reject = null,
    config = {}
  ) {

    if(batchInputData.length < 1){
      resolve && resolve([]);
      return [];
    }

    try {
      var configDefaults = {
        mutationBatchCount: 10,
        maximumAllowedNumberOfMutations: null,
        batchQueryInterval: 500,//ms
        remainingMutations: batchInputData.length
      }
      config = Object.assign({}, configDefaults, config);

      var [mutation, config] = this.generateMutation(batchInputData, inputDataToQueryMapper, config);
      var mutationQuery = gql`${mutation}`;
      var mutationResult;

      mutationResult = await this.create(mutationQuery, {});

      if (nestedProperty.has(mutationResult, 'data.extensions.cost')){
        const extensionsCost = mutationResult.data.extensions.cost;
        //After the first query set the mutation count per batch such that cost incurred is 80% of the maximum available cost.
        if (!config.maximumAllowedNumberOfMutations) {
          config.maximumAllowedNumberOfMutations =
            config.mutationBatchCount * parseInt(0.8 * (extensionsCost.throttleStatus.maximumAvailable / extensionsCost.requestedQueryCost));
            config.mutationBatchCount = config.maximumAllowedNumberOfMutations;
        }
        //Adjust the query interval so that the query cost get restored atleast the same rate as it gets consumed.
        config.batchQueryInterval =
          Math.max(1000 * parseInt((extensionsCost.throttleStatus.maximumAvailable / extensionsCost.throttleStatus.restoreRate)), config.batchQueryInterval);
        if (config.remainingMutations > 0) {
          var mutationResultNew = await new Promise((function (resolve, reject) {
            setTimeout((function () {
              this.batchScheduleMutations(
                batchInputData,
                inputDataToQueryMapper,
                resolve,
                reject,
                config
              );
            }).bind(this), config.batchQueryInterval);
          }).bind(this));

          resolve && resolve(deepmerge(mutationResultNew, mutationResult.data));
        } else {
          resolve && resolve(mutationResult.data);
        }
      } else {
        if (reject) {
          reject(new Error('Batch query failed :' + JSON.stringify(mutationResult)));
        } else {
          throw new Error('Batch query failed :' + JSON.stringify(mutationResult));
        }
      }
    } catch (error) {
      if (reject) {
        reject(error);
      } else {
        throw error;
      }
    }
  },

  /**
    * Generates a batch of mutations.
    *
    * @since 1.0.0
    * @param {object} batchInputData input data.
    * @param {function} inputDataToQueryMapper maps the input data to mutation body.
    * @param {function} config configuration for batch scheduling.
    * @return void
    */
  generateMutation: function(batchInputData, inputDataToQueryMapper, config) {
    var mutation = `mutation{`,
      singleQuery;

    let index = 0;
    while(index< config.mutationBatchCount && config.remainingMutations > 0){
      singleQuery = inputDataToQueryMapper(batchInputData[batchInputData.length - config.remainingMutations])
      mutation += singleQuery+'\n';
      config.remainingMutations--;
      index++;
    }
    mutation += `}`;

    return [mutation, config];
  },

};


graphQueries.init();

module.exports = graphQueries;
