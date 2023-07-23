const { hash, compare } = require("bcryptjs");
const { xor } = require("lodash");
const { emailPatternCheck } = require("../utils/emailPatternCheck");
const { error } = require("neo4j-driver");

const { GraphQLError } = require("graphql/error/GraphQLError");

function _throw(e, m) {
  console.log("this is the condition", e);
  if (e) {
    return null;
  }
  console.log("this is the error", m);
  throw m;
}

class InvalidInputError extends GraphQLError {
  constructor(message) {
    super(message);
    this.message = "Invalid Input";
  }
}

// to do: add login controller and query

// the code is verbose and the query fields are not self explanatory i.e some fields
// are available that it is not neccessary. e.g: in login  query we can query secuirty question
// though it should be unavailable. IDK how to fix it for now maybe graphql structure is not suitble for
// such purposes.
const getAllUsers = async (parent, args, context) => {
  let session = context.driver.session({ database: process.env.DATABASE });
  try {
    let res = [];
    const hi = await session.executeRead(async (tx) => {
      return await tx.run(`
          MATCH (p:user)
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
    return res;
    // response = { name, email: last_name };
  } catch (error) {
    console.log(error);
  } finally {
    session.close();
  }
};

const getASingleUser = async (parent, args, context) => {
  const id = args?.id;
  let session = context.driver.session({ database: process.env.DATABASE });
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

const createUser = async (parent, args, context) => {
  const id = args?.id;
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
    /** (I) hash password */
    argumentKey === "password" &&
      (async () => {
        const hashedPassword = await hash(args.password, 10);
        argumentValue = `${hashedPassword}`;
      })();
    argumentKey === "email" &&
      (() => {
        try {
          _throw(emailPatternCheck(argumentValue), InvalidInputError);
        } catch (error) {
          console.log("this is error", error);
          throw error;
        }
      })();
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
  console.log(`{${createUserProperties}}`);

  /** creating a session for requesting to the database */
  let session = context.driver.session({ database: process.env.DATABASE });
  try {
    const hashedPassword = await hash(args.password, 10);
    console.log(hashedPassword);
    let res = [];
    const hi = await session.executeWrite(async (tx) => {
      args.securityQuestionAnswer;
      return await tx.run(`
          CREATE (p:user {${createUserProperties}})
          RETURN p
          `);
    });
    console.log("this is records=>", hi.records);

    hi.records?.forEach((element) => {
      element.forEach((subElement) => {
        console.log("this is subelement", subElement);
        const {
          name,
          email,
          password,
          securityQuestion,
          securityQuestionAnswer,
        } = subElement["properties"];
        res.push({ id: subElement.elementId, email, name });
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

const login = async (parent, args, context) => {
  const id = args?.id;
  console.log(args);
  let session = context.driver.session({ database: process.env.DATABASE });
  try {
    const hashedPassword = await hash(args.password, 10);
    let res = [];
    const hi = await session.executeWrite(async (tx) => {
      let createUserProperties = "";
      for (key in args) {
        const property = `${key}: ${
          typeof args[key] === "string"
            ? '"' + args[key] + '"' + ","
            : args[key] + ","
        }`;
        createUserProperties += property;
      }
      console.log(createUserProperties);
      // args.name+
      // ","+
      // "email: "
      // args.email
      // ","
      // "password: "
      // args.passwordz
      // ","+
      // "securityQuestion: "+
      // args.securityQuestion+
      // ","
      // "securityQuestionAnswer: ",
      args.securityQuestionAnswer;
      return await tx.run(`
          CREATE (p:user {${createUserProperties.slice(0, -1)}})
          RETURN p
          `);
    });
    console.log("this is records=>", hi.records);

    hi.records?.forEach((element) => {
      element.forEach((subElement) => {
        console.log("this is subelement", subElement);
        const {
          name,
          email,
          password,
          securityQuestion,
          securityQuestionAnswer,
        } = subElement["properties"];
        res.push({ id: subElement.elementId, email, name });
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

module.exports = {
  getAllUsers,
  getASingleUser,
  createUser,
  login,
};
