var neo4j = require("neo4j-driver");
/**
 * It configures and reurns driver object to interact with a Neo4j instance.
 * @returns
 */
const startDB = async () => {
  {
    // URI examples: 'bolt://127.0.0.1', 'neo4j+s://xxx.databases.neo4j.io'
    // enviroment variables for configuration of the driver
    const URI = process.env.URI;
    const USER = process.env.USER;
    const PASSWORD = process.env.PASSWORD;
    let driver;

    try {
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
      const serverInfo = await driver.getServerInfo();
      console.log("Connection established");
      console.log(serverInfo);
      return driver;
    } catch (err) {
      throw Error(`Connection error\n${err}\nCause: ${err.cause}`);
    }
  }
};
module.exports = startDB;
