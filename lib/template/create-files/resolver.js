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

function createNewResolver(that, serverPath, fileName, templateData) {
  const resolverDir = path.join(serverPath, 'resolvers');
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/empty-resolver.ejs'), path.join(resolverDir, `${fileName}.js`), templateData);

  return [[], [], {}];
}

function createNewResolverWithDef(that, resolverPath, fileName, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/with-def.ejs'), path.join(resolverPath, `${fileName}.js`), templateData);

  return [[], [], {}];
}

module.exports = {
  createResolvers,
  createNewResolver,
  createNewResolverWithDef,
};
