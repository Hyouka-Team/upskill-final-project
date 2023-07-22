const { hash, compare } = require("bcryptjs");
// to do: add login controller and query

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
};
