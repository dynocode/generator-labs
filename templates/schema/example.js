const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    Example(id: ID!): Example!
    Examples: [Example!]
  }

  extend type Mutation {
    createExample(
      name: String!
      value: Boolean
    ): Example!
    updateExample(
      id: ID!
      name: String
      value: Boolean
    ): Example!
    deleteExample(id: ID!): Example!
  }

  type Example {
    id: ID!
    name: String!
    value: Boolean
    createdAt: DateTime
    updatedAt: DateTime
  }
`;
