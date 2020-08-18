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
  updateResolverIndex,
};
