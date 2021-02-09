const path = require('path');

const { defaultFilePaths } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createLint(that, toDirPath, templateData) {
  const lang = that.ctx.language.toLowerCase();
  const devDeps = [
    'eslint',
    'eslint-plugin-chai-friendly',
    'eslint-plugin-import',
  ];

  const pkScript = {
    lint: 'eslint --ignore-path .eslintignore ./',
  };

  if (lang === 'ts') {
    devDeps.push(...[
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
    ]);
    pkScript.lint = `${pkScript} .ts`;
  }

  copyTpl(
    that,
    defaultFilePaths.eslintignore,
    path.join(toDirPath, '.eslintignore'),
    templateData,
  );

  copyTpl(
    that,
    defaultFilePaths.eslintrc[lang],
    path.join(toDirPath, `.eslintrc.${lang}`),
    templateData,
  );
  return [
    [],
    devDeps,
    pkScript,
  ];
}

module.exports = {
  createLint,
};
