const InvalidInputError = require("../errors/InvalidInputError");

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
      // console.log(finalResponse);
      // console.log(typeof _fields);
      // console.log(_fields);
      // console.log("352", subElement);
      // finalResponse[i] = {};

      // console.log(subElement["properties"][element]);
      // });
    });
    // console.log("vaaaaaaaay", typeof finalResponse, finalResponse);
    return finalResponse;
  } catch (error) {
    console.log(error);
  }
  // console.log("thats records", response.records);
};

/**
 * {
 *  * See {@link getAllNotes}
 *  * See {@link getASingleNote}
 *  * See {@link addNote}
 *  * See {@link updateNote}
 *  * See {@link removeNote}

 */
/**
 * validate for password format and email format.
 */
const { reqToNeo4j } = require("./reqToNeo4j");

const { NetworkError } = require("graphql-http");
const { response } = require("express");

// to do: add login controller and query

// the code is verbose and the query fields are not self explanatory i.e some fields
// are available that it is not neccessary. e.g: in login  query we can query secuirty question
// though it should be unavailable. IDK how to fix it for now maybe graphql structure is not suitble for
// such purposes.
const getAllNotes = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
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
  console.log("hi", finalResponse);
  if (finalResponse == "") {
    console.log("baba");
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
  console.log("hi", finalResponse);
  if (finalResponse == "") {
    console.log("baba");
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

  // console.log("hi", finalResponse);
  // console.log(response);
  console.log(finalResponse === []);
  if (finalResponse.length === 0) {
    return undefined;
  } else {
    console.log("fh");

    return finalResponse[0];
  }
};

const updateNote = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
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

  // console.log("hi", finalResponse);
  // console.log(response);
  console.log(response);
  if (finalResponse.length === 0) {
    return undefined;
  } else {
    console.log("fh");

    return finalResponse[0];
  }
};
const deleteNote = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  try {
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
  //   console.log(response);
  let finalResponse = Neo4jResIterator(response, ["elementId"]);

  // console.log("hi", finalResponse);
  // console.log(response);
  console.log(response);
  if (finalResponse.length === 0) {
    return undefined;
  } else {
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
