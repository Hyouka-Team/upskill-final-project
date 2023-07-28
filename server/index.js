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

const { start } = require("./start");

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
