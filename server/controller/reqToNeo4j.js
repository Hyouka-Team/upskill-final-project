/**
 *
 * @param {string} typeOfTransaction
 * @param {*} driver
 * @param {string} dbName
 * @param {object} utils
 * @param {object} args
 *
 */
const reqToNeo4j = async (typeOfTransaction, driver, dbName, args, utils) => {
  let cypherCommand = new String();
  const cypherFilter = new Object();

  if (typeOfTransaction === "getAllUsers") {
    cypherCommand = `
      MATCH (p:user)
      RETURN p
      `;
  } else if (typeOfTransaction === "getNodeByProperties") {
    cypherCommand = `
      MATCH (p${args.labels} {${args.propertes}})
      RETURN p
      `;
  } else if (typeOfTransaction === "getASingleUser") {
    cypherCommand = `
      MATCH (p:user)
      WHERE ID(p) = ${args.id.split(":")[2]}
      RETURN p
      `;
  } else if (typeOfTransaction === "createUser") {
    cypherCommand = `CREATE (p:user {${args}})
      RETURN p`;
  } else if (typeOfTransaction === "addToken") {
    cypherCommand = `Match (p:user)
    WHERE id(p) = ${args.id.split(":")[2]}
    SET p.refreshToken ="${args.refreshToken}"
    RETURN p`;
    console.log(cypherCommand);
  } else if (typeOfTransaction === "login") {
    cypherCommand = `MATCH (p:user {${args}}) 
    RETURN p`;
  }
  let session = driver.session({ database: process.env.DATABASE });
  let response = undefined;
  try {
    if (
      typeOfTransaction === "createUser" ||
      typeOfTransaction === "addToken"
    ) {
      response = await session.executeWrite(async (tx) => {
        return await tx.run(`${cypherCommand}`);
      });
    } else {
      response = await session.executeRead(async (tx) => {
        return await tx.run(`${cypherCommand}`);
      });
    }
    console.log("the response", response.records);

    return response;
  } catch (error) {
    return error;
  } finally {
    session.close();
  }
};

module.exports = { reqToNeo4j };
