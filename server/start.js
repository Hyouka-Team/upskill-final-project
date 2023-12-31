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

 * Utility Object as dependencies for a full-fledged express server
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
 * @param {Utils} utils the middlewares or dependencies needed for running the server
 */
const giveAppAndServer = {
  app: new Object(),
  server: new Object(),
};
const start = async (app, utils, startType) => {
  // if the app or database works the function returns starttype in testing enviroment
  const startStatus = {
    db: false,
    app: false,
  };
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

  try {
    const driver = await startDB();
    try {
      const serverInfo = await driver.getServerInfo();
      startStatus.db = true;
    } catch (error) {
      startStatus.db = false;
    }
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
    /**  Graphql API */
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
  /**
   * Mount your Altair GraphQL client
   * */
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

  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server listening on port ${process.env.PORT || 4000}!`);
    startStatus.app = true;
    console.log(startStatus);
  });
  if (startType === true) {
    return {
      startStatus,
    };
  }
};

module.exports = {
  start,
};
