const path = require('path');

const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const parser = require('@babel/parser').parse;
const generate = require('@babel/generator').default;

const { writeFile } = require('../../fs');
const { getAstFromFile } = require('../get-ast');
const { getPathModelNameMap } = require('../mongo-model');

function createImportStatement(varName, importFrom, ctx) {
  if (ctx.importExport) {
    return `import ${varName} from '${importFrom}';`;
  }
  return `const ${varName} = require('${importFrom}');`;
}

function appendImport(code, lastImport) {
  return lastImport.insertAfter(parser(code, { sourceType: 'module' }));
}

function transformPathModelNameMap(map, modelPath) {
  const entries = Object.entries(map);
  return Object.fromEntries(entries
    .map(([filePath, modelName]) => {
      const localPath = filePath.replace(modelPath, '.');
      return [localPath, modelName];
    }));
}

function diffImports(areImported, allImports) {
  const areImportedE = Object.entries(areImported);
  const allImportsE = Object.entries(allImports);
  const toRemove = areImportedE.filter(([fileP]) => !allImports[fileP]);
  const toAdd = allImportsE.filter(([fileP]) => !areImported[fileP]);
  return [
    toRemove,
    toAdd,
  ];
}

async function updateModelIndex(modelPath, ctx) {
  const indexFilePath = path.join(modelPath, 'index.js'); // TODO: ts support;
  const ast = getAstFromFile(indexFilePath);

  const fullPathModelNameMap = getPathModelNameMap(modelPath);
  const localPathModelNameMap = transformPathModelNameMap(fullPathModelNameMap, modelPath);

  let lastImport;
  let properties;

  const areImported = {};
  const importNodesMap = {};
  const modelPropsNodesMap = {};

  traverse(ast, {
    ObjectExpression(astPath) {
      // Store all props in object 'models', that is the object that is exported.
      const parentIsVar = t.isVariableDeclarator(astPath.parent);
      const parentIsModels = astPath.parent.id && astPath.parent.id.name === 'models';
      if (parentIsVar && parentIsModels) {
        properties = astPath.node.properties;
      }
    },
    ObjectProperty(astPath) {
      // Get all props, from the model object, so we can delete them if needed.
      if (astPath.parentPath.parentPath.node.id.name === 'models') {
        const { name } = astPath.node.key;
        modelPropsNodesMap[name] = astPath;
      }
    },
    ImportDeclaration(astPath) {
      const varName = astPath.node.specifiers[0].local.name;
      const source = astPath.node.source.value;
      if (source.substr(0, 2) === './') {
        areImported[`${source}.js`] = varName;
        importNodesMap[`${source}.js`] = astPath;
      }
      lastImport = astPath;
    },
  });

  const [remove, add] = diffImports(areImported, localPathModelNameMap);

  add.forEach(([modelFilePath, modelName]) => {
    const importCode = createImportStatement(modelName, modelFilePath, ctx);
    appendImport(importCode, lastImport);

    const id = t.identifier(modelName);
    properties.push(t.objectProperty(id, id, false, true)); // TODO: how to add dangling comma?
  });

  remove.forEach(([modelFilePath, modelName]) => {
    importNodesMap[modelFilePath].remove();
    modelPropsNodesMap[modelName].remove();
  });

  const updatedIndex = generate(ast).code;

  return writeFile(indexFilePath, updatedIndex);
}

module.exports = {
  updateModelIndex,
};
