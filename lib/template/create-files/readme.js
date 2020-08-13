const { defaultFilePaths } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createReadme(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.readme, 'README.md', templateData);
}

module.exports = {
  createReadme,
};
