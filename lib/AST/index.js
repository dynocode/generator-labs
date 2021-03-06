const mongoAst = require('./mongo-model');
const schemaAst = require('./gql-schema');
const { getAstFromFile, getAstFromCode } = require('./get-ast');
const {
  resolveObjectExpression,
  resolveArrayExpression,
  resolveIdentifier,
  resolveStringLiteral,
  resolveBooleanLiteral,
  resolveObjectProperty,
} = require('./resolve-ast');

module.exports = {
  getAstFromFile,
  getAstFromCode,
  mongo: mongoAst,
  resolveObjectExpression,
  resolveArrayExpression,
  resolveIdentifier,
  resolveStringLiteral,
  resolveBooleanLiteral,
  resolveObjectProperty,
  schemaAst,
};
