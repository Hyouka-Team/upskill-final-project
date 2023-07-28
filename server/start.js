/**
 *     createHandler,
    schema,
    notesSchema,
    altairExpress,
    startDB,
    cors,
    bodyParser,
    cookieParser,
    isAuth,

 * A student
 * @typedef {Object} Utils
 * @property {*} createHandler - Create a GraphQL request handler for  the express framework
 * @property {*} schema - The Schema of /graphql endpoint for supplying the root types of each type of operation,
 * query and mutation
 * @property {*} notesSchema - The Schema of /notesAPI endpoint for supplying the root types of each type of operation,
 * query and mutation
 * @property {*} altairExpress - A tool for requesting the graphql endpoints for development enviroment
 * @property {*} startDB - Start and connect to neo4j database
 * @property {*} cors - For cross-origin request
 * @property {*} bodyParser - Parse request body for express
 * @property {*} cookieParser - Parse cookies in request header for express
 * @property {*} isAuth - Middleware for authentication for protected route /notesAPI
 */

/**
 * Invoke this function and the server will start
 * @param {Object} app the express app needed as an argument for running the server app
 * @param {} utils the middlewares or dependencies needed for running the server
 */
const giveAppAndServer = {
  app: new Object(),
  server: new Object(),
};
const start = async (app, utils, startType) => {
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
    app.use(cookieParser());
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
  if (startType === true) {
    return {
      app,
    };
  }
};

module.exports = {
  start,
};
