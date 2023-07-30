const { request, gql } = require("graphql-request");
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
const myApp = null;

// test("db and server works", async () => {
//   expect.assertions(1);
//   let app1 = await app;
//   console.log(myApp);
//   expect(typeof myApp).toBe("object");
// });
let serverStatus = null;
describe("App and Database Workds", () => {
  beforeAll(async () => {
    serverStatus = await start(
      app,
      {
        createHandler,
        schema,
        notesSchema,
        altairExpress,
        startDB,
        cors,
        bodyParser,
        cookieParser,
        isAuth,
      },
      true
    );
    console.log("Ready....go!");
  });
  test("App works", async () => {
    setTimeout(async () => {
      return expect(await serverStatus.startStatus).toEqual({
        db: true,
        app: true,
      });
    }, 100000);

    console.log("here is server status", serverStatus.startStatus);
  });
});
