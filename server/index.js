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

// for configing the enviroment variables
require("dotenv/config");

const startDB = require("./neo4j");
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
const start = async (app, utils) => {
  const { createHandler, schema, altairExpress, startDB } = utils;

  /**
   * Mount your Altair Grap hQL client
   * */
  try {
    const driver = await startDB();
    // console.log(schema);

    /**
     * Neccessary middlewares
     */
    app.use(
      "/graphql",
      createHandler({
        schema,
        context: {
          driver,
        },
      })
    );
  } catch (error) {
    console.log(error);
    return null;
  }

  app.use(
    "/altair",
    altairExpress({
      endpointURL: "/graphql",
      subscriptionsEndpoint: `ws://localhost:4000/subscriptions`,
      initialQuery: `{ getData { id name surname } }`,
    })
  );
  app.listen(process.env.PORT || 4000, () =>
    console.log(`Server listening on port ${process.env.PORT || 4000}!`)
  );
};

/**
 * See {@link start}
 */
start(app, {
  createHandler,
  schema,
  altairExpress,
  startDB,
});
