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
  } else if (typeOfTransaction === "getASingleUser") {
    cypherCommand = `
      MATCH (p:user)
      WHERE ID(p) = ${args.id.split(":")[2]}
      RETURN p
      `;
  } else if (typeOfTransaction === "createUser") {
    cypherCommand = `CREATE (p:user {${args}})
      RETURN p`;
  } else if (typeOfTransaction === "login") {
    cypherCommand = `MATCH (p:user {${args}})
      RETURN p.email as email, p.password as password`;
  }
  let session = driver.session({ database: process.env.DATABASE });
  let response = undefined;
  try {
    if (typeOfTransaction === "createUser") {
      response = await session.executeWrite(async (tx) => {
        return await tx.run(`${cypherCommand}`);
      });
    } else {
      response = await session.executeRead(async (tx) => {
        return await tx.run(`${cypherCommand}`);
      });
    }

    return response;
  } catch (error) {
    return error;
  } finally {
    session.close();
  }
};

module.exports = { reqToNeo4j };
