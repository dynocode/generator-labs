const path = require('path');

const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const parser = require('@babel/parser').parse;
const generate = require('@babel/generator').default;

const { writeFile, getFilePathToAllFilesInDir } = require('../../fs');
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

function diffImportedFiles(importedFiles, allFiles) {
  const toRemove = importedFiles.filter((filePath) => !allFiles.includes(filePath));
  const toAdd = allFiles.filter((filePath) => !importedFiles.includes(filePath));
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

async function updateSchemaIndex(schemaPath, ctx) {
  const allSchemaFilePaths = await getFilePathToAllFilesInDir(schemaPath);
  const allLocalSchemaFilePaths = allSchemaFilePaths.map((sp) => sp.replace(schemaPath, '.'));

  const indexFilePath = path.join(schemaPath, 'index.js'); // TODO: ts support;
  const ast = getAstFromFile(indexFilePath);

  let lastImport;
  let properties;

  const areImported = [];
  const importedFilePathVarName = {};
  const importNodesMap = {};
  const exportPropsNodesMap = {};

  traverse(ast, {
    ImportDeclaration(astPath) {
      const varName = astPath.node.specifiers[0].local.name;
      const source = astPath.node.source.value;
      if (source.substr(0, 2) === './') {
        areImported.push(`${source}.js`);
        importedFilePathVarName[`${source}.js`] = varName;
        importNodesMap[`${source}.js`] = astPath;
      }
      lastImport = astPath;
    },
    ExportDefaultDeclaration(astPath) {
      properties = astPath.node.declaration.properties;
    },
    ObjectProperty(astPath) {
      if (t.isExportDefaultDeclaration(astPath.parentPath.parentPath.node)) {
        exportPropsNodesMap[astPath.node.key.name] = astPath;
      }
    },
  });

  const [remove, add] = diffImportedFiles(areImported, allLocalSchemaFilePaths);

  add.forEach((filePath) => {
    const schemaName = filePath
      .replace('./', '')
      .replace('.js', '')
      .split('-')
      .map((word, index) => {
        if (index > 0) {
          const firstChar = word.substr(0, 1).toUpperCase();
          return `${firstChar}${word.substring(1)}`;
        }
        return word;
      })
      .join('');
    const importCode = createImportStatement(schemaName, filePath, ctx);
    appendImport(importCode, lastImport);

    const id = t.identifier(schemaName);
    properties.push(t.objectProperty(id, id, false, true)); // TODO: how to add dangling comma?
  });

  remove.forEach((filePath) => {
    importNodesMap[filePath].remove();
    const varName = importedFilePathVarName[filePath];
    if (exportPropsNodesMap[varName]) {
      exportPropsNodesMap[varName].remove();
    }
  });
  const updatedIndex = generate(ast).code;
  return writeFile(indexFilePath, updatedIndex);
}

async function updateResolverIndex(resolverPath, ctx) {
  const allResolverFilePaths = await getFilePathToAllFilesInDir(resolverPath);
  const allLocalResolverFilePaths = allResolverFilePaths.map((sp) => sp.replace(resolverPath, '.'));

  const indexFilePath = path.join(resolverPath, 'index.js'); // TODO: ts support;
  const ast = getAstFromFile(indexFilePath);

  let lastImport;
  let astArray;

  const areImported = [];
  const importedFilePathVarName = {};
  const importNodesMap = {};
  const exportPropsNodesMap = {};

  traverse(ast, {
    ImportDeclaration(astPath) {
      const varName = astPath.node.specifiers[0].local.name;
      const source = astPath.node.source.value;
      if (source.substr(0, 2) === './') {
        areImported.push(`${source}.js`);
        importedFilePathVarName[`${source}.js`] = varName;
        importNodesMap[`${source}.js`] = astPath;
      }
      lastImport = astPath;
    },
    ArrayExpression(astPath) {
      if (astPath.parent.id && astPath.parent.id.name === 'resolvers') {
        astArray = astPath.node.elements;
      }
    },
    Identifier(astPath) {
      const pathToDef = astPath.parentPath.parentPath.node;
      if (pathToDef && pathToDef.id && pathToDef.id.name === 'resolvers') {
        exportPropsNodesMap[astPath.node.name] = astPath;
      }
    },
  });

  const [remove, add] = diffImportedFiles(areImported, allLocalResolverFilePaths);

  add.forEach((filePath) => {
    const resolverName = filePath
      .replace('./', '')
      .replace('.js', '')
      .split('-')
      .map((word, index) => {
        if (index > 0) {
          const firstChar = word.substr(0, 1).toUpperCase();
          return `${firstChar}${word.substring(1)}`;
        }
        return word;
      })
      .join('');
    const importCode = createImportStatement(resolverName, filePath, ctx);
    appendImport(importCode, lastImport);

    const id = t.identifier(resolverName);
    astArray.push(id); // TODO: how to add dangling comma?
  });

  remove.forEach((filePath) => {
    importNodesMap[filePath].remove();
    const varName = importedFilePathVarName[filePath];
    if (exportPropsNodesMap[varName]) {
      exportPropsNodesMap[varName].remove();
    }
  });
  const updatedIndex = generate(ast).code;
  return writeFile(indexFilePath, updatedIndex);
}

module.exports = {
  updateModelIndex,
  updateSchemaIndex,
  updateResolverIndex,
};
