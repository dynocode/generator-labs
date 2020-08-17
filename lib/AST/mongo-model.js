/* eslint-disable no-use-before-define */
const path = require('path');
const fs = require('fs');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const { getAstFromFile } = require('./get-ast');

function getAstForAllModels(modelPath) {
  const blackList = ['index.js', 'index.ts'];
  const allFileNames = fs.readdirSync(modelPath);
  const allModelAst = allFileNames
    .filter((name) => !blackList.includes(name))
    .map((name) => path.join(modelPath, name))
    .map((filePath) => getAstFromFile(filePath));
  return allModelAst;
}

function resolveObjectExpression(obj) {
  return obj.properties.map((item) => {
    if (t.isObjectProperty(item)) {
      return resolveObjectProperty(item);
    }
    console.log('******** no resolver for: at resolveObjectExpression  **********');
    console.log(item.type);
    console.log('********  END *********');
    return {};
  }).reduce((res, item) => Object.assign(res, item), {});
}

function resolveArrayExpression(obj) {
  return obj.elements.map((item) => {
    if (t.isObjectProperty(item)) {
      return resolveObjectProperty(item);
    }
    if (t.isObjectExpression(item)) {
      return resolveObjectExpression(item);
    }
    if (t.isIdentifier(item)) {
      return resolveIdentifier(item);
    }
    if (t.isStringLiteral(item)) {
      return resolveStringLiteral(item);
    }
    if (t.isBooleanLiteral(item)) {
      return resolveBooleanLiteral(item);
    }
    console.log('******** no resolver for: at resolveArrayExpression **********');
    console.log(item.type);
    console.log('********  END *********');
    return '';
  });
}

function resolveIdentifier(val) {
  return val.name;
}

function resolveStringLiteral(val) {
  return val.value;
}

function resolveBooleanLiteral(val) {
  return val.value;
}

function resolveObjectProperty(obj) {
  const key = obj.key.name;
  const val = obj.value;
  if (t.isObjectExpression(val)) {
    return { [key]: resolveObjectExpression(val) };
  }
  if (t.isIdentifier(val)) {
    return { [key]: val.name };
  }
  if (t.isStringLiteral(val)) {
    return { [key]: val.value };
  }
  if (t.isBooleanLiteral(val)) {
    return { [key]: val.value };
  }
  if (t.isArrayExpression(val)) {
    return { [key]: resolveArrayExpression(val) };
  }
  if (t.isMemberExpression(val)) {
    return { [key]: generate(val).code.trim() };
  }
  if (t.isNumericLiteral(val)) {
    return { [key]: val.value };
  }
  if (t.isArrowFunctionExpression(val)) {
    return '';
  }
  console.log('******** no resolver for: at resolveObjectProperty **********');
  console.log(val.type);
  console.log('********  END *********');
  return '';
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

module.exports = {
  getAstForAllModels,
  resolveObjectExpression,
  resolveArrayExpression,
  resolveIdentifier,
  resolveStringLiteral,
  resolveBooleanLiteral,
  resolveObjectProperty,
  getModelDefFromAst,
  getModelDefsFromAsts,
};
