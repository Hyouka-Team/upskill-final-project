// @ts-check

const {
  getAllUsers,
  getASingleUser,
  login,
  createUser,
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

class GraphQLObjectTypeFields {
  constructor(fields) {
    this.fields = fields;
  }
  create() {
    const fields = this.fields;
    const fieldsObject = new Object();
    for (let property in fields) {
      fieldsObject[property] = {
        type: fields.property,
      };
    }
    return fieldsObject;
  }
  returnFields() {
    const fields = this.fields;
    return fields;
  }
}
const NoteTypeFields = new GraphQLObjectTypeFields({
  id: GraphQLID,
  title: GraphQLString,
  payload: GraphQLString,
});
const NoteTypeFieldsObject = NoteTypeFields.create();
const NotesType = new GraphQLObjectType({
  name: "Notes",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    payload: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    note: {
      type: NotesType,
      async resolve(parent, args, context) {
        return dummyData[dummyData.length - 1];
      },
    },
    notes: {
      type: NotesType,
      async resolve(parent, args, context) {
        return dummyData[dummyData.length - 1];
      },
    },
  }),
});

const MutationQuery = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addNote: {
      type: NotesType,
      args: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        payload: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        dummyData.push(args);
        return dummyData[dummyData.length - 1];
      },
    },
    updateNote: {
      type: NotesType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args, context) {
        return dummyData[dummyData.length - 1];
      },
    },
    deleteNote: {
      type: NotesType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args, context) {
        return dummyData[dummyData.length - 1];
      },
    },
  }),
});
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: MutationQuery,
});
