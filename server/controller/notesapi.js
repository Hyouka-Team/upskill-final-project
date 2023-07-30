const InvalidInputError = require("../errors/InvalidInputError");

/**
 * It gets a response of a Neo4j Transaction which looks like:
 * .records (type : array) [  record{... _fields (type: usually an object)}]
 * For each recors it looks in given fields and if it was present inside the object it will be added inside a object of each record
 * and that function will be added to final response array.
 * If the records was empty it should return an empty array
 * @param {*} response
 * @param {array} fieldsToGive
 * @returns {array}
 */
const Neo4jResIterator = (response, fieldsToGive) => {
  try {
    const finalResponse = [];
    response?.records?.forEach((record, i) => {
      const { _fields, _fieldLookup } = record;
      finalResponse[i] = new Object();
      if (_fields.length === 1 && typeof _fields[0] === "object") {
        fieldsToGive?.forEach((element, j) => {
          if (element === "elementId") {
            finalResponse[i]["id"] = _fields[0]["elementId"];
          } else {
            finalResponse[i][element] = _fields[0]["properties"][element];
          }
        });
      }
    });
    return finalResponse;
  } catch (error) {
    console.log(error);
  }
};

/**
 * {
 *  * See {@link getAllNotes}
 *  * See {@link getASingleNote}
 *  * See {@link addNote}
 *  * See {@link updateNote}
 *  * See {@link deleteNote}

 */
/**
 * validate for password format and email format.
 */
const { reqToNeo4j } = require("./reqToNeo4j");

const { NetworkError } = require("graphql-http");
const { response } = require("express");

// to do: add login controller and query

const getAllNotes = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
    //req to neo4j
    response = await reqToNeo4j(
      "notes",
      driver,
      process.env.DATABASE,
      args,
      {}
    );
  } catch (error) {
    console.log(error);
    throw NetworkError;
  }
  const finalResponse = Neo4jResIterator(response, [
    "title",
    "payload",
    "elementId",
  ]);
  if (finalResponse == "") {
    return undefined;
  } else {
    return Neo4jResIterator(response, ["title", "payload", "elementId"]);
  }
};

const getASingleNote = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
    //req to neo4j
    response = await reqToNeo4j("note", driver, process.env.DATABASE, args, {});
  } catch (error) {
    console.log(error);
    throw NetworkError;
  }

  const finalResponse = Neo4jResIterator(response, [
    "title",
    "payload",
    "elementId",
  ]);
  if (finalResponse == "") {
    return undefined;
  } else {
    return Neo4jResIterator(response, ["title", "payload", "elementId"])[0];
  }
};

const addNote = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
    //req to neo4j
    response = await reqToNeo4j(
      "addNote",
      driver,
      process.env.DATABASE,
      {
        title: args.title,
        email: req.userId,
        payload: args.payload,
      },
      {}
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
  //   console.log(response);
  let finalResponse = Neo4jResIterator(response, [
    "title",
    "payload",
    "elementId",
  ]);

  if (finalResponse.length === 0) {
    // the query didn't result anything and its a [] so we can't pick its first index
    return undefined;
  } else {
    // the response is an array, although our query type is not a list so we should pick the first index
    return finalResponse[0];
  }
};

const updateNote = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
    //req to neo4j
    response = await reqToNeo4j(
      "updateNote",
      driver,
      process.env.DATABASE,
      {
        title: args.title,
        id: args.id,
        payload: args.payload,
      },
      {}
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
  //   console.log(response);
  let finalResponse = Neo4jResIterator(response, [
    "title",
    "payload",
    "elementId",
  ]);

  if (finalResponse.length === 0) {
    // the query didn't result anything and its a [] so we can't pick its first index
    return undefined;
  } else {
    // the response is an array, although our query type is not a list so we should pick the first index
    return finalResponse[0];
  }
};
const deleteNote = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
    //req to neo4j
    response = await reqToNeo4j(
      "deleteNote",
      driver,
      process.env.DATABASE,
      {
        id: args.id,
      },
      {}
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
  let finalResponse = Neo4jResIterator(response, ["elementId"]);

  console.log(response);
  if (finalResponse.length === 0) {
    return undefined;
  } else {
    // the response is an array, although our query type is not a list so we should pick the first index
    return finalResponse[0];
  }
};
module.exports = {
  getAllNotes,
  getASingleNote,
  addNote,
  updateNote,
  deleteNote,
};
