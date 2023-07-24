const { error } = require("neo4j-driver");
const { hash, compare } = require("bcryptjs");

const InvalidInputError = require("../errors/InvalidInputError");

/**
 * validate for password format and email format.
 */
const {
  isEmailFormatValidOrThrowError: checkForEmail,
  isPasswordFormatValidOrThrowError: checkForPassword,
} = require("./validation/checkInputsFormat");
const {
  createAccessToken,
  createRefreshToken,
} = require("./validation/tokens");
const { reqToNeo4j } = require("./reqToNeo4j");

const { hashPassword } = require("./validation/hash");
const { NetworkError } = require("graphql-http");
const { response } = require("express");

// to do: add login controller and query

// the code is verbose and the query fields are not self explanatory i.e some fields
// are available that it is not neccessary. e.g: in login  query we can query secuirty question
// though it should be unavailable. IDK how to fix it for now maybe graphql structure is not suitble for
// such purposes.
const getAllUsers = async (parent, args, context) => {
  console.log(Object.keys(context));
  const { res, req } = context;
  const { driver } = req;
  let response = null;
  let finalResponse = [];
  try {
    response = await reqToNeo4j(
      "getAllUsers",
      driver,
      process.env.DATABASE,
      args,
      {}
    );
  } catch (error) {
    console.log(error);
    throw NetworkError;
  }
  response.records?.forEach((element) => {
    element.forEach((subElement) => {
      const { name, last_name: email, password } = subElement["properties"];
      finalResponse.push({ id: subElement.elementId, email, name, password });
    });
  });
  return finalResponse;
};

const getASingleUser = async (parent, args, context) => {
  const { res, req } = context;
  const { driver } = req;
  const id = args?.id;
  let session = driver.session({ database: process.env.DATABASE });
  try {
    let res = [];
    console.log();
    const hi = await session.executeRead(async (tx) => {
      return await tx.run(`
          MATCH (p:user)
          WHERE ID(p) = ${args.id.split(":")[2]}
          RETURN p
          `);
    });
    console.log("this is records=>", hi.records);

    hi.records?.forEach((element) => {
      element.forEach((subElement) => {
        console.log("this is subelement", subElement);
        const { name, last_name: email, password } = subElement["properties"];
        res.push({ id: subElement.elementId, email, name, password });
      });
      // console.log("this is a sole element=>", element);
      // let recordNode = new Object();
    });
    console.log(res);
    return res[0];
    // response = { name, email: last_name };
  } catch (error) {
    console.log(error);
  } finally {
    session.close();
  }
};

// here is under refactoring
const createUser = async (parent, args, context) => {
  const { resp, req } = context;
  const { driver } = req;
  const id = args?.id;
  const res = [];
  // console.log("this is arg key array:", typeof driver);
  // iterate through arguments, setting different behaviour based on each argument
  /**
   * Permitted Arguments:   name, email, password, securityQuestionAnswer and securityQuestion
   * for password argument we shoud hash it for saving it in database
   */
  const argumentsArray = Object.keys(args);
  let createUserProperties = "";
  for (let index = 0; index < argumentsArray.length; index++) {
    console.log(`{${createUserProperties}}`);

    /**
     * Checking for:

     * I) if the argument key is password then we should hash its password
     * II) (Type checking is not neccessary in this api
     * because the graphql we'll do the burden of arguments type checking)
     * checking argument types and add "" if it a string
     * III) if it is not  the last argument so add comma (It throws an error if we add comma in
     * the end of properties)
     *  
     */
    /** the key and value */

    const argumentKey = argumentsArray[index];
    // the value mutable because we want to hash the value of password
    let argumentValue = args[argumentKey];
    // console.log("arg", argumentKey);
    // console.log("arg", argumentValue);
    /** (I) hash password */
    // console.log("hi", argumentKey, argumentValue);

    if (argumentKey === "password") {
      checkForPassword(argumentValue, InvalidInputError);

      argumentValue = await hashPassword(argumentValue);
    }
    // to do: turn it to a function
    argumentKey === "email" && checkForEmail(argumentValue, InvalidInputError);
    if (typeof argumentValue === "string") {
      argumentValue = `"${argumentValue}"`;
    }

    /** (III) add properties to createUserProperties for cypher query*/
    keyAndValueString = argumentKey + " : " + argumentValue;
    createUserProperties = createUserProperties + keyAndValueString;
    /** it it is not the last index then add comma */
    if (index !== argumentsArray.length - 1) {
      createUserProperties += ",";
    }
  }
  console.log("final", createUserProperties);
  /** creating a session for requesting to the database */
  try {
    response = await reqToNeo4j(
      "createUser",
      driver,
      process.env.DATABASE,
      createUserProperties,
      {}
    );
  } catch (err) {
    throw InvalidInputError;
  }
  response.records?.forEach((element) => {
    element.forEach((subElement) => {
      // console.log("this is subelement", subElement);
      const { name, email, password } = subElement["properties"];
      res.push({ id: subElement.elementId, email, name, password });
    });
    // console.log("this is a sole element=>", element);
    // let recordNode = new Object();
  });
  console.log(res);
  return res[0];
};

const login = async (parent, args, context) => {
  /**
   * /we want to get email and password from user then we check the database
  for the existence of such account and we take password property of matched node.
  we use compare method to check equality of args.password and response.password
  then if it was valid we wil make a refresh token and access token
   */
  const res = [];
  const { res: resp, req } = context;
  const { driver } = req;
  console.log("this is arg key array:");
  // iterate through arguments, setting different behaviour based on each argument
  /**
   * Permitted Arguments:   name, email, password, securityQuestionAnswer and securityQuestion
   * for password argument we shoud hash it for saving it in database
   */
  const argumentsArray = Object.keys(args);
  let createUserProperties = "";
  for (let index = 0; index < argumentsArray.length; index++) {
    /**
     * Checking for:

     * I) if the argument key is password then we should hash its password
     * II) (Type checking is not neccessary in this api
     * because the graphql we'll do the burden of arguments type checking)
     * checking argument types and add "" if it a string
     * III) if it is not  the last argument so add comma (It throws an error if we add comma in
     * the end of properties)
     *  
     */
    /** the key and value */

    const argumentKey = argumentsArray[index];
    // the value mutable because we want to hash the value of password
    let argumentValue = args[argumentKey];
    console.log("arg", argumentKey);
    console.log("arg", argumentValue);
    /** (I) hash password */
    // console.log("hi", argumentKey, argumentValue);

    if (argumentKey === "password") {
      continue;
    }
    // to do: turn it to a function
    if (typeof argumentValue === "string") {
      argumentValue = `"${argumentValue}"`;
    }

    /** (III) add properties to createUserProperties for cypher query*/
    keyAndValueString = argumentKey + " : " + argumentValue;
    createUserProperties = createUserProperties + keyAndValueString;
    /** it it is not the last index then add comma */
    // if (index !== argumentsArray.length - 1) {
    //   createUserProperties += ",";
    // }
  }
  console.log(`{${createUserProperties}}`);
  let response;
  /** creating a session for requesting to the database */
  response = await reqToNeo4j(
    "login",
    driver,
    process.env.DATABASE,
    createUserProperties,
    {}
  );
  console.log(response);
  console.log("res");
  /**
     * wont work here, sample structure of record func:
     *   Record {
    keys: [ 'email', 'password' ],
    length: 2,
    _fields: [
      'danial@mail.com',
      '$2a$10$1FqYtGRrSzNzacE0tC4ZBeE4eX4Vg5V4jksik8i58oXKbsWaV9wIW'
    ],
    _fieldLookup: { email: 0, password: 1 }
  }
     */
  // response.records?.forEach((element) => {
  //   element.forEach((subElement) => {
  //     // console.log("this is subelement", subElement);
  //     const { email } = subElement["properties"];
  //     res.push({ email, password });
  //   });
  // console.log("this is a sole element=>", element);
  // let recordNode = new Object();
  // });
  // console.log(res);
  // 1. Find user in array. If not exist send error
  console.log("args", args, response?.records[0]?._fields[1]);
  /*
  order-matters
  */
  let valid = await compare(args.password, response?.records[0]?._fields[1]);

  if (!valid) {
    console.log("!pass");

    throw InvalidInputError;
  }

  // 2. Compare crypted password and see if it checks out. Send error if not

  // 3. Create Refresh- and Accesstoken
  const accesstoken = createAccessToken(args.email);
  const refreshtoken = createRefreshToken(args.email);
  console.log("res const", resp);
  resp.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    path: "admin/refresh_token",
  });
  return {
    email: response?.records[0]?._fields[0],
    password: refreshtoken,
  };
};

module.exports = {
  getAllUsers,
  getASingleUser,
  createUser,
  login,
};
