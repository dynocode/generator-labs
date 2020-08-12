const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createResolvers(that, serverPath, templateData) {
  const resolversDir = path.join(serverPath, 'resolvers');
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/example.ejs'), path.join(resolversDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/index.ejs'), path.join(resolversDir, 'index.js'), templateData);

  that.config.set({ resolversDir });

  return [[], [], {}];
}

function createNewResolver(that, serverPath, fileName, templateData) {
  const resolversDir = path.join(serverPath, 'resolvers');
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/empty-resolver.ejs'), path.join(resolversDir, `${fileName}.js`), templateData);

  return [[], [], {}];
}

module.exports = {
  createResolvers,
  createNewResolver,
};
