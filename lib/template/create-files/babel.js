const path = require('path');
const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createBasicBabel(that, serverPath) {
  copyTpl(that, path.join(globalTemplatePath, 'babel/rc/basic'), path.join(serverPath, '.babelrc'));
  const relativeRootPath = serverPath.replace(that.contextRoot, '.');

  return [
    [],
    [
      '@babel/cli',
      '@babel/core',
      '@babel/node',
      '@babel/preset-env',
      '@babel/register',
      'rimraf',
    ],
    {
      build: 'npm run clean && babel src -d dist',
      clean: 'rimraf dist',
      start: `npm run build && nodemon -r dotenv/config ${path.join(relativeRootPath, 'dist/index.js')}`,
      serve: `node -r dotenv/config ${path.join(relativeRootPath, 'dist/index.js')}`,
    },
  ];
}

module.exports = {
  createBasicBabel,
};
