var neo4j = require("neo4j-driver");
const startDB = async () => {
  {
    // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
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
      console.log(`Connection error\n${err}\nCause: ${err.cause}`);
    }
  }
};
module.exports = startDB;
