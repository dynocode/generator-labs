const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createModels(that, serverPath, templateData) {
  const modelDir = path.join(serverPath, 'models');
  copyTpl(that, path.join(globalTemplatePath, 'models/example.ejs'), path.join(modelDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'models/index.ejs'), path.join(modelDir, 'index.js'), templateData);
  that.config.set({ modelDir });

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
  const modelDir = path.join(serverPath, 'models');
  copyTpl(that, path.join(globalTemplatePath, 'models/empty-model.ejs'), path.join(modelDir, `${fileName}.js`), templateData);

  return [[], [], {}];
}

module.exports = {
  createModels,
  createModel,
};
