const { defaultFilePaths } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createEditorconfig(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.editorconfig, '.editorconfig', templateData);
}

module.exports = {
  createEditorconfig,
};
