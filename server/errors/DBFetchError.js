const { GraphQLError } = require("graphql/error/GraphQLError");

class DBFetchError extends GraphQLError {
  constructor(message) {
    super(message);
    this.message = "Database Fetch Error";
  }
}

module.exports = DBFetchError;
