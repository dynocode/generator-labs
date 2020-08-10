const { gql } = require('apollo-server-express');

const exampleSchema = require('./example');

const baseSchema = gql`
  scalar Date
  scalar DateTime
  scalar Time
  scalar Search

  type Query {
    ping: String
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

module.exports = {
  baseSchema,
  exampleSchema,
};
