const path = require('path');

const globalTemplatePath = path.join(__dirname, '../../templates');

const defaultFilePaths = {
  dockerCompose: path.join(globalTemplatePath, 'docker/compose/mongo.yaml'),
  gitignore: path.join(globalTemplatePath, 'dotfiles/.gitignore'),
  editorconfig: path.join(globalTemplatePath, 'dotfiles/.editorconfig'),
  readme: path.join(globalTemplatePath, 'README.md'),

  eslintignore: path.join(globalTemplatePath, 'lint/.eslintignore'),
  eslintrc: path.join(globalTemplatePath, 'lint/.eslintrc.js'),

  env: path.join(globalTemplatePath, 'dotfiles/.example.env'),
  envDev: path.join(globalTemplatePath, 'dotfiles/.example.env.dev'),
  envTest: path.join(globalTemplatePath, 'dotfiles/.example.env.test'),
  envProd: path.join(globalTemplatePath, 'dotfiles/.example.env.prod'),

};

module.exports = {
  globalTemplatePath,
  defaultFilePaths,
};
