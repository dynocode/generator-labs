const path = require('path');

const globalTemplatePath = path.join(__dirname, '../../templates');

const defaultFilePaths = {
  dockerCompose: path.join(globalTemplatePath, 'docker/compose/mongo.yaml'),
  gitignore: path.join(globalTemplatePath, 'dotfiles/template.gitignore'),
  editorconfig: path.join(globalTemplatePath, 'dotfiles/template.editorconfig'),
  readme: path.join(globalTemplatePath, 'README.md'),

  eslintignore: path.join(globalTemplatePath, 'lint/template.eslintignore'),
  eslintrc: path.join(globalTemplatePath, 'lint/template.eslintrc.js'),

  env: path.join(globalTemplatePath, 'dotfiles/template.example.env'),
  envDev: path.join(globalTemplatePath, 'dotfiles/template.example.env.dev'),
  envTest: path.join(globalTemplatePath, 'dotfiles/template.example.env.test'),
  envProd: path.join(globalTemplatePath, 'dotfiles/template.example.env.prod'),

};

module.exports = {
  globalTemplatePath,
  defaultFilePaths,
};
