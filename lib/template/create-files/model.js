const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createModels(that, serverPath, templateData) {
  const modelsDir = path.join(serverPath, 'models');
  copyTpl(that, path.join(globalTemplatePath, 'models/example.ejs'), path.join(modelsDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'models/index.ejs'), path.join(modelsDir, 'index.js'), templateData);
  that.config.set({ modelsDir });

  return [
    [
      'mongo-sanitize',
      'mongoose',
    ],
    [],
    {},
  ];
}

function createModel(that, serverPath, fileName, templateData) {
  const modelsDir = path.join(serverPath, 'models');
  copyTpl(that, path.join(globalTemplatePath, 'models/empty-model.ejs'), path.join(modelsDir, `${fileName}.js`), templateData);

  return [[], [], {}];
}

module.exports = {
  createModels,
  createModel,
};
