// @ts-check

/**
 * @file index.js is the root file for this example app
 * @author Brad Traversy
 * @see <a href="https://traversymedia.com">Traversy Media</a>
 */

const express = require("express");

let bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const schema = require("./schema/graphql");
const notesSchema = require("./schema/notesSchema");
const { isAuth } = require("./middlewares/isAuth");
// for configing the enviroment variables
require("dotenv/config");

const startDB = require("./neo4j");
const { createHandler } = require("graphql-http/lib/use/express");

/**
 * this is a package for testing the graphql api
 */
const { altairExpress } = require("altair-express-middleware");
const { locatedError } = require("graphql");

/**
 * Invoke this function and the server will start
 * @param {Object} app the express app needed as an argument for running the server app
 * @param {Object} utils the middlewares or dependencies needed for running the server
 */
const start = async (app, utils) => {
  const {
    createHandler,
    schema,
    notesSchema,
    altairExpress,
    startDB,
    cors,
    bodyParser,
    cookieParser,
    isAuth,
  } = utils;

  // console.log("shema", schema);
  /**
   * Mount your Altair Grap hQL client
   * */
  try {
    const driver = await startDB();
    // console.log(schema);
    /**
     * Neccessary middlewares
     */
    const middleware = async (req, res, next) => {
      req.driver = driver;
      next();
    };
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json(), cookieParser());
    app.use("/graphql", middleware, (req, res) => {
      return createHandler({
        schema,
        context: { req, res },
      })(req, res);
    });
    app.use("/notesAPI", isAuth, middleware, (req, res) => {
      return createHandler({
        schema: notesSchema,
        context: { req, res },
      })(req, res);
    });
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
  app.use(
    "/altair1",
    altairExpress({
      endpointURL: "/notesAPI",
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
  notesSchema,
  altairExpress,
  startDB,
  cors,
  bodyParser,
  cookieParser,
  isAuth,
});
