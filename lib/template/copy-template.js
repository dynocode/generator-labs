const path = require('path');

const { defaultFilePaths, globalTemplatePath } = require('./file-paths');

function copyTpl(that, from, to, templateData) {
  const templatePath = that.templatePath(from);
  const destinationPath = that.destinationPath(to);
  const args = [
    templatePath,
    destinationPath,
  ];

  if (templateData) {
    args.push(templateData);
  }

  return that.fs.copyTpl(...args);
}

function basicServerDefault(that, serverPath) {
  copyTpl(that, defaultFilePaths.readme, 'README.md');

  // Lint
  copyTpl(that, defaultFilePaths.eslintignore, path.join(serverPath, '.eslintignore'));
  copyTpl(that, defaultFilePaths.eslintrc, path.join(serverPath, '.eslintrc.js'));

  // ENV
  copyTpl(that, defaultFilePaths.env, path.join(serverPath, '.env'));
  copyTpl(that, defaultFilePaths.envDev, path.join(serverPath, '.env.dev'));
  copyTpl(that, defaultFilePaths.envTest, path.join(serverPath, '.env.test'));
  copyTpl(that, defaultFilePaths.envProd, path.join(serverPath, '.env.prod'));

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

function createModels(that, serverPath) {
  copyTpl(that, path.join(globalTemplatePath, 'models/example.js'), path.join(serverPath, 'models/example.js'));
  copyTpl(that, path.join(globalTemplatePath, 'models/index.js'), path.join(serverPath, 'models/index.js'));

  return [
    [
      'mongo-sanitize',
      'mongoose',
    ],
    [],
    {},
  ];
}

function createSchema(that, serverPath) {
  copyTpl(that, path.join(globalTemplatePath, 'schema/example.js'), path.join(serverPath, 'schema/example.js'));
  copyTpl(that, path.join(globalTemplatePath, 'schema/index.js'), path.join(serverPath, 'schema/index.js'));

  return [
    [
      'apollo-server-express',
    ],
    [],
    {},
  ];
}

function createResolvers(that, serverPath) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/example.js'), path.join(serverPath, 'resolvers/example.js'));
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/index.js'), path.join(serverPath, 'resolvers/index.js'));

  return [
    [],
    [],
    {},
  ];
}

function createServerIndex(that, serverPath) {
  copyTpl(that, path.join(globalTemplatePath, 'servers/basic-express-apollo.js'), path.join(serverPath, 'index.js'));

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
  copyTpl,
  createModels,
  createSchema,
  createResolvers,
  basicServerDefault,
  createServerIndex,
};
