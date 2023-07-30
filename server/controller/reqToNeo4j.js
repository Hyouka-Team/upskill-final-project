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
  /**
   * type of Transaction produces a proper cypher command relevent to the type of query
   */
  if (typeOfTransaction === "notes") {
    /** It matches all of the neo4j nodes with :note label */
    cypherCommand = `
      MATCH (p:note)
      RETURN p
      `;
  } else if (typeOfTransaction === "getAllUsers") {
    /** It matches all of the neo4j nodes with :user  label */

    cypherCommand = `
      MATCH (p:user)
      RETURN p
      `;
  } else if (typeOfTransaction === "note") {
    /** It matches a neo4j node with :note label and specific id */

    cypherCommand = `
    MATCH (p:note)
    WHERE ID(p) = ${args.id.split(":")[2]}
    RETURN p
    `;
  } else if (typeOfTransaction === "addNote") {
    /** It creates a neo4j node with :note label and relevent properties */

    cypherCommand = `
      MATCH (u:user {email:"${args.email}"})
      CREATE (u) -[:created_note]-> (p:note {payload: "${args.payload}", title: "${args.title}"})
      RETURN p
      `;
  } else if (typeOfTransaction === "deleteNote") {
    /** It deletes a specfic node with :note label and specific id */

    cypherCommand = `MATCH (p:note)
    WHERE ID(p) = ${args.id.split(":")[2]}
    DETACH DELETE p
    RETURN p

      `;
  } else if (typeOfTransaction === "updateNote") {
    /** It updates a specfic node with :note label and specific id */

    cypherCommand = `
    MATCH (p:note)
    WHERE ID(p) = ${args.id.split(":")[2]}
    SET p.title = "${args.title}", p.payload= "${args.payload}"
    RETURN p
      `;
  } else if (typeOfTransaction === "getNodeByProperties") {
    /** It makes a dynamic cypher command with specific label and properties */

    cypherCommand = `
      MATCH (p${args.labels} {${args.propertes}})
      RETURN p
      `;
  } else if (typeOfTransaction === "getASingleUser") {
    /** It matches a node with specific id and :user label */

    cypherCommand = `
      MATCH (p:user)
      WHERE ID(p) = ${args.id.split(":")[2]}
      RETURN p
      `;
  } else if (typeOfTransaction === "createUser") {
    /** It creates a neo4j node with :user label and relevent properties */

    cypherCommand = `CREATE (p:user {${args}})
      RETURN p`;
  } else if (typeOfTransaction === "addToken") {
    /** It sets refresh token for a user with args.id */

    cypherCommand = `Match (p:user)
    WHERE id(p) = ${args.id.split(":")[2]}
    SET p.refreshToken ="${args.refreshToken}"
    RETURN p`;
    console.log(cypherCommand);
  } else if (typeOfTransaction === "login") {
    /** Its function is almost the same as getNodeByProperties type of transaction but it only matches nodes with :user id */
    cypherCommand = `MATCH (p:user {${args}}) 
    RETURN p`;
  }
  let session = driver.session({ database: process.env.DATABASE });
  let response = undefined;
  try {
    /** Transaction Types of Create, delete and update need database writing access */
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
