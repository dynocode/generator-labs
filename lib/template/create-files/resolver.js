const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createResolvers(that, serverPath, templateData) {
  const resolverDir = path.join(serverPath, 'resolvers');
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/example.ejs'), path.join(resolverDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/index.ejs'), path.join(resolverDir, 'index.js'), templateData);

  that.config.set({ resolverDir });

  return [[], [], {}];
}

function createNewResolver(that, resolverPath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/empty-resolver.ejs'), resolverPath, templateData);

  return [[], [], {}];
}

function createNewResolverWithDef(that, resolverPath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/with-def.ejs'), resolverPath, templateData);

  return [[], [], {}];
}

module.exports = {
  createResolvers,
  createNewResolver,
  createNewResolverWithDef,
};
