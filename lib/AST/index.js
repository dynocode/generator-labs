const mongoAst = require('./mongo-model');
const { getAstFromFile, getAstFromCode } = require('./get-ast');

module.exports = {
  getAstFromFile,
  getAstFromCode,
  mongo: mongoAst,
};
