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
beforeAll(async () => {
  const myApp = await start(
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
  return myApp;
});
test("db and server works", async () => {
  expect.assertions(1);
  let app1 = await app;
  console.log(myApp);
  expect(typeof myApp).toBe("object");
});

describe("Graphql api and Notes API", () => {
  test("API works", async () => {
    const document = gql`
      mutation {
        addUser(
          name: "hassan"
          email: "hassan@gmail.com"
          password: "12E!dddddd@34"
          securityQuestion: "hi"
          securityQuestionAnswer: "hi"
        ) {
          name
          email
        }
      }
    `;
    const response = await request("http://localhost:4000/graphql", document);
    console.log(response);
    expect(response).toEqual({
      addUser: {
        name: "hassan",
        email: "hassan@gmail.com",
      },
    });
  });
});

afterAll(() => {
  done();
});
