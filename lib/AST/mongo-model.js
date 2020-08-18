const path = require('path');
const fs = require('fs');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const { getAstFromFile } = require('./get-ast');
const { resolveObjectExpression } = require('./resolve-ast');

function getAstForAllModels(modelPath) {
  const blackList = ['index.js', 'index.ts'];
  const allFileNames = fs.readdirSync(modelPath);
  const allModelAst = allFileNames
    .filter((name) => !blackList.includes(name))
    .map((name) => path.join(modelPath, name))
    .map((filePath) => getAstFromFile(filePath));
  return allModelAst;
}

function getModelDefFromAst(ast) {
  let model;
  let modelName;
  traverse(ast, {
    enter(astPath) {
      if (
        t.isCallExpression(astPath)
        && astPath.node.callee
        && astPath.node.callee.property
        && astPath.node.callee.property.name === 'model') {
        modelName = astPath.node.arguments[0].value;
      }
    },
    NewExpression(astPath) {
      const { callee } = astPath.node;
      if (
        callee.type === 'MemberExpression'
        && callee.property.type === 'Identifier'
        && callee.property.name === 'Schema'
      ) {
        model = resolveObjectExpression(astPath.node.arguments[0]);
      }
    },
  });
  return { [modelName]: model };
}

function getModelDefsFromAsts(asts) {
  return asts
    .map((ast) => getModelDefFromAst(ast))
    .reduce((res, model) => Object.assign(res, model), {});
}

function getPathModelNameMap(modelDir) {
  const blackList = ['index.js', 'index.ts'];
  const allFileNames = fs.readdirSync(modelDir);
  const allAst = allFileNames
    .filter((name) => !blackList.includes(name))
    .map((name) => path.join(modelDir, name))
    .map((filePath) => [filePath, getAstFromFile(filePath)]);

  const pathModelName = allAst.map(([filePath, ast]) => {
    let modelName;
    traverse(ast, {
      enter(astPath) {
        if (
          t.isCallExpression(astPath)
          && astPath.node.callee
          && astPath.node.callee.property
          && astPath.node.callee.property.name === 'model') {
          modelName = astPath.node.arguments[0].value;
        }
      },
    });
    return [filePath, modelName];
  });
  return Object.fromEntries(pathModelName);
}

module.exports = {
  getAstForAllModels,
  getModelDefFromAst,
  getModelDefsFromAsts,
  getPathModelNameMap,
};
