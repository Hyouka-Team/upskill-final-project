// @ts-check

const {
  getAllUsers,
  getASingleUser,
  login,
  createUser,
  tokenRefresh,
} = require("../controller/authapi");

const { GraphQLSchema } = require("graphql");
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
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args, context) {
        return getASingleUser(parent, args, context);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, context) {
        return getAllUsers(parent, args, context);
      },
    },
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
