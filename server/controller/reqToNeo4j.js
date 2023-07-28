/**
 * This is a function for faciliation of requesting to the Database.
 *
 * @param {string} typeOfTransaction the function behhaves differently based on typeof transaction
 * @param {*} driver the driver of neo4j for requesting to the database
 * @param {string} dbName where transactions take place
 * @param {object} utils does'nt do that much for now, reserved for futher development.
 * @param {object} args any useful utility for perfoming the request for example, properties of the cypher command
 *
 */
const reqToNeo4j = async (typeOfTransaction, driver, dbName, args, utils) => {
  let cypherCommand = new String();
  const cypherFilter = new Object();

  if (typeOfTransaction === "notes") {
    cypherCommand = `
      MATCH (p:note)
      RETURN p
      `;
  } else if (typeOfTransaction === "getAllUsers") {
    cypherCommand = `
      MATCH (p:user)
      RETURN p
      `;
  } else if (typeOfTransaction === "note") {
    cypherCommand = `
    MATCH (p:note)
    WHERE ID(p) = ${args.id.split(":")[2]}
    RETURN p
    `;
  } else if (typeOfTransaction === "addNote") {
    cypherCommand = `
      MATCH (u:user {email:"${args.email}"})
      CREATE (u) -[:created_note]-> (p:note {payload: "${args.payload}", title: "${args.title}"})
      RETURN p
      `;
  } else if (typeOfTransaction === "deleteNote") {
    cypherCommand = `MATCH (p:note)
    WHERE ID(p) = ${args.id.split(":")[2]}
    DETACH DELETE p
    RETURN p

      `;
  } else if (typeOfTransaction === "updateNote") {
    cypherCommand = `
    MATCH (p:note)
    WHERE ID(p) = ${args.id.split(":")[2]}
    SET p.title = "${args.title}", p.payload= "${args.payload}"
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
      typeOfTransaction === "addToken" ||
      typeOfTransaction === "createNote" ||
      typeOfTransaction === "addNote" ||
      typeOfTransaction === "updateNote" ||
      typeOfTransaction === "deleteNote"
    ) {
      response = await session.executeWrite(async (tx) => {
        return await tx.run(`${cypherCommand}`);
      });
      console.log("the response", response.records);
    } else {
      console.log(cypherCommand);
      response = await session.executeRead(async (tx) => {
        return await tx.run(`${cypherCommand}`);
      });
    }

    return response;
  } catch (error) {
    console.log(error);
    return error;
  } finally {
    session.close();
  }
};

module.exports = { reqToNeo4j };
