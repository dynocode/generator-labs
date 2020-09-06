const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createResolvers(that, filePath, indexFilePath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/example.ejs'), filePath, templateData);
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/index.ejs'), indexFilePath, templateData);

  return [[], [], {}];
}

function createNewResolver(that, filePath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/empty-resolver.ejs'), filePath, templateData);

  return [[], [], {}];
}

function createNewResolverWithDef(that, filePath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/with-def.ejs'), filePath, templateData);

  return [[], [], {}];
}

module.exports = {
  createResolvers,
  createNewResolver,
  createNewResolverWithDef,
};
