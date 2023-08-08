// @ts-check

const {
  getAllUsers,
  getASingleUser,
  login,
  createUser,
  tokenRefresh,
  logOut,
} = require("../controller/authapi");

const { GraphQLSchema, GraphQLBoolean } = require("graphql");
const {
  GraphQLList,
  GraphQLInt,
  isNonNullType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInterfaceType,
} = require("graphql");

const _ = require("lodash");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const NewUserType = new GraphQLObjectType({
  name: "NewUser",
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});
const TokenType = new GraphQLObjectType({
  name: "TokenRefresh",
  fields: () => ({
    token: { type: GraphQLString },
  }),
});
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    login: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        return login(parent, args, context);
      },
    },
    tokenRefresh: {
      type: TokenType,
      async resolve(parent, args, context) {
        return tokenRefresh(parent, args, context);
      },
    },
    logOut: {
      type: new GraphQLObjectType({
        name: "Success",
        fields: () => ({
          success: { type: GraphQLBoolean },
        }),
      }),
      async resolve(parent, args, context) {
        return logOut(parent, args, context);
      },
    },
  }),
});

const MutationQuery = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addUser: {
      type: NewUserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        securityQuestion: { type: GraphQLString },
        securityQuestionAnswer: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        // args will return an object consisting of arguments of the graphql request
        return createUser(parent, args, context);
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: MutationQuery,
});
