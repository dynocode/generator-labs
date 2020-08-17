const fs = require('fs');
const parser = require('@babel/parser').parse;

function getAstFromFile(filePath) {
  const file = fs.readFileSync(filePath).toString();
  const ast = parser(file, { sourceType: 'module' });
  return ast;
}

function getAstFromCode(code) {
  const ast = parser(code, { sourceType: 'module' });
  return ast;
}

module.exports = {
  getAstFromFile,
  getAstFromCode,
};
