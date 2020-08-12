const path = require('path');
const { defaultFilePaths, globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');
const { createLint } = require('./lint');

function basicServerDefault(that, serverPath, templateData) {
  const prodDeps = [];
  const devDeps = [];
  const scripts = {};

  copyTpl(that, defaultFilePaths.readme, 'README.md');

  // Lint
  const [lintProdDeps, lintDevDeps, lintScripts] = createLint(that, serverPath, templateData);
  prodDeps.push(...lintProdDeps);
  devDeps.push(...lintDevDeps);
  Object.assign(scripts, lintScripts);

  // ENV
  copyTpl(that, defaultFilePaths.env, path.join(serverPath, '.env'));
  copyTpl(that, defaultFilePaths.envDev, path.join(serverPath, '.env.dev'));
  copyTpl(that, defaultFilePaths.envTest, path.join(serverPath, '.env.test'));
  copyTpl(that, defaultFilePaths.envProd, path.join(serverPath, '.env.prod'));

  return [prodDeps, devDeps, scripts];
}

function createServerIndex(that, serverPath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'servers/basic-express-apollo.ejs'), path.join(serverPath, 'index.js'), templateData);

  return [
    [
      'cors',
      'morgan',
      'express',
      'body-parser',
      'apollo-server-express',
    ],
    [
      'nodemon',
      'dotenv',
    ],
    {
      start: `nodemon -r dotenv/config ${path.join(serverPath, 'index.js')}`,
      serve: `node -r dotenv/config ${path.join(serverPath, 'index.js')}`,
    },
  ];
}

module.exports = {
  basicServerDefault,
  createServerIndex,
};
