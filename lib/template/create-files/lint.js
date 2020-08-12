const path = require('path');

const { defaultFilePaths } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createLint(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.eslintignore, path.join(toDirPath, '.eslintignore'), templateData);
  copyTpl(that, defaultFilePaths.eslintrc, path.join(toDirPath, '.eslintrc.js'), templateData);

  return [
    [],
    [
      'eslint',
      'eslint-config-airbnb-base',
      'eslint-plugin-chai-friendly',
      'eslint-plugin-import',
    ],
    {
      lint: 'eslint --ignore-path .eslintignore ./',
    },
  ];
}

module.exports = {
  createLint,
};
