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
const {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
  getASingleNote,
  notesOfAUser,
  noteAuthor,
} = require("../controller/notesapi");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    notes: {
      type: new GraphQLList(NotesType),
      async resolve(parent, args, context) {
        return notesOfAUser(parent, args, context);
      },
    },
  }),
});

const NotesType = new GraphQLObjectType({
  name: "Notes",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    payload: { type: GraphQLString },
    user: {
      type: UserType,
      async resolve(parent, args, context) {
        return noteAuthor(parent, args, context);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    note: {
      type: NotesType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args, context) {
        return await getASingleNote(parent, args, context);
      },
    },
    notes: {
      type: new GraphQLList(NotesType),
      async resolve(parent, args, context) {
        return await getAllNotes(parent, args, context);
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
        return await addNote(parent, args, context);
      },
    },
    updateNote: {
      type: NotesType,
      args: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        payload: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        return await updateNote(parent, args, context);
      },
    },
    deleteNote: {
      type: NotesType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args, context) {
        return await deleteNote(parent, args, context);
      },
    },
  }),
});
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: MutationQuery,
});
