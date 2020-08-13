const { defaultFilePaths } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createDockerCompose(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.dockerCompose, 'docker-compose.yaml', templateData);
}

module.exports = {
  createDockerCompose,
};
