/* eslint-disable no-use-before-define */

const generate = require('@babel/generator').default;
const t = require('@babel/types');

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

module.exports = {
  resolveObjectExpression,
  resolveArrayExpression,
  resolveIdentifier,
  resolveStringLiteral,
  resolveBooleanLiteral,
  resolveObjectProperty,
};
