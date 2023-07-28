const { GraphQLError } = require("graphql/error/GraphQLError");

class InvalidInputError extends GraphQLError {
  constructor(message) {
    super(message);
    this.message = "Invalid Input";
  }
}

module.exports = InvalidInputError;
