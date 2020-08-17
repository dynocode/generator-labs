/* eslint-disable no-underscore-dangle */
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const gqlObjectTypes = ['Query', 'Mutation'];

function getBaseNode(schemaArray, currentItem, currentIndex) {
  const isExtend = currentItem === 'extend';
  const isExtendType = isExtend && schemaArray[currentIndex + 1] === 'type';
  const isExtendQuery = isExtendType && schemaArray[currentIndex + 2] === 'Query' && schemaArray[currentIndex + 3] === '{';
  const isExtendMutation = isExtendType && schemaArray[currentIndex + 2] === 'Mutation' && schemaArray[currentIndex + 3] === '{';
  const isTypeDeclaration = currentItem === 'type' && !gqlObjectTypes.includes(schemaArray[currentIndex + 1]) && schemaArray[currentIndex + 2] === '{';
  if (isExtendQuery) {
    return { type: 'ExtendTypeQuery', _readFrom: currentIndex + 4 };
  }
  if (isExtendMutation) {
    return { type: 'ExtendTypeMutation', _readFrom: currentIndex + 4 };
  }

  if (isTypeDeclaration) {
    return { type: 'GqlSchemaObjectDef', name: schemaArray[currentIndex + 1], _readFrom: currentIndex + 3 };
  }
  return {};
}

function gqlSchemaParser(data) {
  const schema = data.trim();
  const splitOnChar = schema.replace(/\n/g, ' ').split(' ')
    .map((item) => item.trim())
    .filter((item) => item !== ''); // Other falsy values are allowed;

  const a = [];
  let temp = {};
  splitOnChar.forEach((item, index) => {
    if (!temp.type) {
      Object.assign(temp, getBaseNode(splitOnChar, item, index));
    }

    if (temp.type === 'GqlSchemaObjectDef' && index >= temp._readFrom) {
      if (!temp.data) {
        temp.data = {};
      }
      if (temp.onKey) {
        temp.data[temp.onKey] = item;
        temp.onKey = null;
      }
      if (item[item.length - 1] === ':') {
        const currentKey = item.substring(0, item.length - 1);
        temp.onKey = currentKey;
        temp.data[currentKey] = null;
      }
      if (item === '{') {
        temp.newOpen = true;
      }
      if (item === '}') {
        a.push(temp);
        temp = {};
      }
      return;
    }

    if ((temp.type === 'ExtendTypeQuery' || temp.type === 'ExtendTypeMutation') && index >= temp._readFrom) {
      if (!temp.data) {
        temp.data = [];
      }
      if (!temp.isStartOfFunction && item.includes('(')) {
        temp.inFunction = true;
        temp.itemIsFunctionStart = true;
      }
      if (!temp.isEndOfFunction && item.includes(')')) {
        temp.inFunction = false;
        temp.itemIsEndOfFunction = true;
      }
      if (temp.itemIsFunctionStart) {
        const name = item.split('(')[0];
        temp.data.push(name);
      }
      if (!temp.inFunction && !temp.itemIsEndOfFunction && item.substring(item.length - 1) === ':') {
        const name = item.split(':')[0];
        temp.data.push(name);
      }
      if (item === '{') {
        temp.newOpen = true;
      }
      if (item === '}') {
        a.push(temp);
        temp = {};
      }
      temp.itemIsFunctionStart = false;
      temp.itemIsEndOfFunction = false;
    }
  });
  return a;
}

function gqlGetFunctionsFromParsedSchema(data) {
  return data.reduce((res, item) => {
    if (item.type === 'ExtendTypeQuery') {
      res.Query.push(...item.data);
    }
    if (item.type === 'ExtendTypeMutation') {
      res.Mutation.push(...item.data);
    }
    return res;
  }, {
    Query: [],
    Mutation: [],
  });
}

function getFunctionNamesFromAst(ast) {
  let fnNames;
  traverse(ast, {
    enter(astPath) {
      const isTemplate = t.isTemplateLiteral(astPath.node);
      const isGql = t.isTaggedTemplateExpression(astPath.parent)
        && astPath.parent.tag
        && astPath.parent.tag.name === 'gql';
      const haveElement = astPath.node.quasis && astPath.node.quasis.length > 0;

      if (isTemplate && isGql && haveElement) {
        const gqlSchema = astPath.node.quasis[0].value.raw;
        const parsed = gqlSchemaParser(gqlSchema);
        fnNames = gqlGetFunctionsFromParsedSchema(parsed);
      }
    },
  });
  return fnNames;
}

module.exports = {
  getFunctionNamesFromAst,
};
