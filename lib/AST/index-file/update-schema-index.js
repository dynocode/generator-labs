const path = require('path');

const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

const { writeFile, getFilePathToAllFilesInDir } = require('../../fs');
const { getAstFromFile } = require('../get-ast');

const {
  createImportStatement,
  appendImport,
  diffImportedFiles,
} = require('./helpers');

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

module.exports = {
  updateSchemaIndex,
};
