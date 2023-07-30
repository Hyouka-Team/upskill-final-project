const { error } = require("neo4j-driver");
const { hash, compare } = require("bcryptjs");
const { verify } = require("jsonwebtoken");

const InvalidInputError = require("../errors/InvalidInputError");

/**
 * {
 *  * See {@link getAllUsers}
 *  * See {@link getASingleUser}
 *  * See {@link createUser}
 *  * See {@link login}
 *  * See {@link tokenRefresh}

 */
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
  /**
   *  * It gets a response of a Neo4j Transaction which looks like:
 * .records (type : array) [  record{... _fields (type: usually an object)}]
 * For each recors it looks in given fields and if it was present inside the object it will be added inside a object of each record
 * and that function will be added to final response array.
 * If the records was empty it should return an empty array

   */
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
  const id = parent?.id;
  console.log("look,id", id);
  let session = driver.session({ database: process.env.DATABASE });
  try {
    let res = [];
    const hi = await session.executeRead(async (tx) => {
      return await tx.run(`
          MATCH (p:user)
          WHERE ID(p) = ${parent.id.split(":")[2]}
          RETURN p
          `);
    });
    /** * It gets a response of a Neo4j Transaction which looks like:
     * .records (type : array) [  record{... _fields (type: usually an object)}]
     * For each recors it looks in given fields and if it was present inside the object it will be added inside a object of each record
     * and that function will be added to final response array.
     * If the records was empty it should return an empty array
     */
    hi.records?.forEach((element) => {
      element.forEach((subElement) => {
        const { name, last_name: email, password } = subElement["properties"];
        res.push({ id: subElement.elementId, email, name, password });
      });
    });
    return res[0];
  } catch (error) {
    console.log(error);
  } finally {
    session.close();
  }
};

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

    if (argumentKey === "password") {
      console.log("pass error");
      checkForPassword(argumentValue, InvalidInputError);
      /** (I) hash password */
      argumentValue = await hashPassword(argumentValue);
    }
    // to do: turn it to a function
    argumentKey === "email" &&
      checkForEmail(argumentValue, InvalidInputError) &&
      console.log("email error");
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
  let response = null;
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
    console.log(err);
    throw InvalidInputError;
  }
  /** * It gets a response of a Neo4j Transaction which looks like:
   * .records (type : array) [  record{... _fields (type: usually an object)}]
   * For each recors it looks in given fields and if it was present inside the object it will be added inside a object of each record
   * and that function will be added to final response array.
   * If the records was empty it should return an empty array
   */
  response.records?.forEach((element) => {
    element.forEach((subElement) => {
      const { name, email, password } = subElement["properties"];
      res.push({ id: subElement.elementId, email, name, password });
    });
  });
  return res[0];
};

const login = async (parent, args, context) => {
  /**
   * /we want to get email and password from user then we check the database
  for the existence of such account and we take password property of matched node.
  we use compare method to check equality of args.password and response.password
  then if it was valid we wil make a refresh token and access token
   */
  let res = [];
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
  }
  let response;
  response = await reqToNeo4j(
    "login",
    driver,
    process.env.DATABASE,
    createUserProperties,
    {}
  );
  response.records?.forEach((element) => {
    element.forEach((subElement) => {
      const { name, email, password } = subElement["properties"];
      res.push({ id: subElement.elementId, email, password });
    });
  });

  let valid = null;
  try {
    /*
  order-matters, hashed password should be the secon argument
  */
    valid = await compare(args.password, res[0].password);
  } catch (error) {
    /**
     * if it is not valid it will throw an eeror
     * Error: Illegal arguments: string, undefined
     * we can add our cusom error
     */
    console.log(error);
  }
  /** If it catches an errorthe valid would be null (falsy) and we want to throw an error in that case  */
  if (!valid) {
    console.log("!pass");

    throw InvalidInputError;
  }

  // 2. Compare crypted password and see if it checks out. Send error if not

  // 3. Create Refresh- and Accesstoken
  const accesstoken = createAccessToken(args.email);

  const refreshtoken = createRefreshToken(args.email);
  /**
   * adding refresh token to Database
   */
  const addRefreshTokenToDatabase = await reqToNeo4j(
    "addToken",
    driver,
    process.env.DATABASE,
    {
      id: res[0].id,
      refreshToken: refreshtoken,
    },
    {}
  );
  resp.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    path: "graphql",
  });

  if (res[0] == undefined) {
    throw new InvalidInputError();
  }
  return { ...res[0], password: accesstoken };
};

const tokenRefresh = async (parent, args, context) => {
  const { res: resp, req } = context;
  const { driver } = req;
  const token = req.cookies.refreshtoken;
  // If we don't have a token in our request
  if (!token) {
    // if we use this graphql tries to send another res and throws such an error

    /**
     * 
     *     return res.json({ accesstoken: "" });
    the xode above is a bad practice and it will throw this error.
Error [ERR_HTTP_HEADERS_SENT]: Cannot render headers after they are sent to the client


     */
    return { token: "" };
  }
  // // We have a token, let's verify it!
  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return { token: "" };
  }
  // token is valid, check if user exist
  // we want .tokenRefresh property of a node with email of payload.userId
  const user = await reqToNeo4j(
    "getNodeByProperties",
    driver,
    process.env.DATABASE,
    {
      labels: ":user",
      propertes: `email:"${payload.userId}"`,
    },
    {}
  );
  if (!user) return { token: "" };
  // console.log(user);
  const [prevRefreshToken, userId, userEmail] = [
    user.records[0]._fields[0].properties.refreshToken,
    user.records[0]._fields[0].elementId,
    user.records[0]._fields[0].email,
  ];
  // console.log(
  //   "this is user",
  //   user.records[0]._fields[0].properties.refreshToken,
  //   user.records[0]._fields[0].elementId
  // );
  // user exist, check if refreshtoken exist on user
  if (prevRefreshToken !== token) return { token: "" };
  // // // token exist, create new Refresh- and accesstoken
  const accesstoken = createAccessToken(payload.userId);
  const refreshtoken = createRefreshToken(payload.userId);
  // // // // // update refreshtoken on user in db
  // // // // Could have different versions instead!
  const addRefreshTokenToDatabase = await reqToNeo4j(
    "addToken",
    driver,
    process.env.DATABASE,
    {
      id: userId,
      refreshToken: refreshtoken,
    },
    {}
  );
  if (
    addRefreshTokenToDatabase.records[0]?._fields[0]?.properties?.email ==
    payload.userId
  ) {
    // // All good to go, send new refreshtoken and accesstoken
    resp.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      path: "graphql",
    });

    return { token: accesstoken };
  }
};
module.exports = {
  getAllUsers,
  getASingleUser,
  createUser,
  login,
  tokenRefresh,
};
