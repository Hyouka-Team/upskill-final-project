// @ts-check

/**
 * @file index.js is the root file for this example app
 * @author Brad Traversy
 * @see <a href="https://traversymedia.com">Traversy Media</a>
 */

const express = require("express");

const cors = require("cors");

const app = express();
const schema = require("./graphql");

const { createHandler } = require("graphql-http/lib/use/express");

/**
 * this is a package for testing the graphql api
 */
const { altairExpress } = require("altair-express-middleware");

/**
 * Invoke this function and the server will start
 * @param {Object} app the express app needed as an argument for running the server app
 * @param {Object} utils the middlewares or dependencies needed for running the server
 */
const start = (app, utils) => {
  const { createHandler, schema, altairExpress } = utils;

  app.use(
    "/graphql",
    createHandler({
      schema,
      context: {
        balal: 1234,
      },
    })
  );

  /**
   * Mount your Altair Grap hQL client
   * */
  app.use(
    "/altair",
    altairExpress({
      endpointURL: "/graphql",
      subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
      initialQuery: `{ getData { id name surname } }`,
    })
  );
  app.listen(4000, () =>
    console.log(`Server listening on port ${process.env.PORT}!`)
  );
};

/**
 * See {@link start}
 */
start(app, {
  createHandler,
  schema,
  altairExpress,
});
