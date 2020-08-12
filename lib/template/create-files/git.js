const { defaultFilePaths } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createGitignore(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.gitignore, '.gitignore', templateData);
}

module.exports = {
  createGitignore,
};
