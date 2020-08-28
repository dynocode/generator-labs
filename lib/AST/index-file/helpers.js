const parser = require('@babel/parser').parse;

function createImportStatement(varName, importFrom, ctx) {
  const importFromPath = importFrom.replace('.js', '');

  if (ctx.importExport) {
    return `import ${varName} from '${importFromPath}';`;
  }
  return `const ${varName} = require('${importFromPath}');`;
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

module.exports = {
  createImportStatement,
  appendImport,
  transformPathModelNameMap,
  diffImports,
  diffImportedFiles,
};
