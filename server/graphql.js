// @ts-check

const { GraphQLSchema } = require("graphql");
const {
  GraphQLList,
  GraphQLInt,
  isNonNullType,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  ValidationContext,
} = require("graphql");

const _ = require("lodash");

/**
 * Fake Database
 */
const dummyData = [
  {
    id: 0,
    email: "billgates@gmail.com",
    name: "Bill Gates",
    password: "",
  },
  {
    id: 1,
    email: "satyanadella@gmail.com",
    name: "Satya Nadella",
    password: "",
  },
];

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        console.log(args);
        return dummyData.find(
          (data) => data.id.toString() === args.id.toString()
        );
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return dummyData;
      },
    },
  }),
});

const MutationQuery = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args, context) {
        console.log("This is the context ->", context);
        try {
          dummyData.push({
            id: dummyData.length,
            email: args.email,
            name: args.name,
            password: args.password,
          });
          console.log(dummyData);
          return {
            id: dummyData.length,
            email: args.email,
            name: args.name,
            password: args.password,
          };
        } catch (err) {
          console.log(err);
        }
      },
    },
  }),

  //   fields: {
  //     user: {
  //       type: UserType,
  //       args: { id: { type: GraphQLID } },
  //       resolve(parent, args) {
  //         return _.find(dummyData, { id: args.id });
  //       },
  //     },
  //     users: {
  //       type: new GraphQLList(),
  //       args: { id: { type: GraphQLID } },
  //       resolve(parent, args) {
  //         return dummyData;
  //       },
  //     },
  //   },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: MutationQuery,
});
