const graphQueries = require("../models/graph-queries");

var responseHandler = {
    init: function() {
        this.graphQlErrorMessage = 'Internal error! A unsuccessful GraphQl call might be cause if it.';
        this.responseSent = false;
        return this;
    },

    objectFound: function(ctx, payload) {
        if (this.responseSent) {
            return;
        }
        const payloadDefault = {
            success: true,
            message: 'Success!'
        }
        payload = Object.assign({}, payloadDefault, payload);
        ctx.body = payload;
        ctx.status = 200;
        this.responseSent = true;
    },

    internalError: function(ctx, payload) {
        if (this.responseSent) {
            return;
        }
        const payloadDefault = {
            success: false,
            message: 'Internal Error!'
        }
        payload = Object.assign({}, payloadDefault, payload);
        ctx.body = payload;
        ctx.status = 500;
        this.responseSent = true;
    },

    notFound: function(ctx, payload) {
        if (this.responseSent) {
            return;
        }
        const payloadDefault = {
            success: false,
            message: 'Not found!'
        }
        payload = Object.assign({}, payloadDefault, payload);
        ctx.body = payload;
        ctx.status = 404;
        this.responseSent = true;
    },

    accessDenied: function(ctx, payload) {
        if (this.responseSent) {
            return;
        }
        const payloadDefault = {
            success: false,
            message: 'Access denied!'
        }
        payload = Object.assign({}, payloadDefault, payload);
        ctx.body = payload;
        ctx.status = 403;
        this.responseSent = true;
    },

    badRequest: function(ctx, payload) {
        if (this.responseSent) {
            return;
        }
        const payloadDefault = {
            success: false,
            message: 'Bad request!'
        }
        payload = Object.assign({}, payloadDefault, payload);
        ctx.body = payload;
        ctx.status = 400;
        this.responseSent = true;
    },

    graphApiRequestFailed: function(ctx, payload) {
        if (this.responseSent) {
            return;
        }
        const payloadDefault = {
            success: false,
            message: 'GraphQl Api request failed.'
        }
        payload = Object.assign({}, payloadDefault, payload);
        ctx.body = payload;
        ctx.status = 401;
        this.responseSent = true;
    },

    /**
      * Error handler 
      * 
      * @since 1.0.0
      * @param {object} ctx current context.
      * @return void
      */
    onError: function(ctx) {
        return (function (err) {
            var payload = {};

            if (err instanceof Error) {
                payload.message = err.message;
                payload.stack = err.stack;

                if (err.networkError && err.networkError.statusCode === 401) {
                    graphQueries.refreshClient();
                    this.graphApiRequestFailed(ctx);
                    return;
                }
            } else {
                payload = err || {};
            }

            ctx ? this.internalError(ctx, payload) : console.log(payload);
        }).bind(this);
    },

};

module.exports = responseHandler;
