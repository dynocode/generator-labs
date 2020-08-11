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

function createModels(that, serverPath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'models/example.ejs'), path.join(serverPath, 'models/example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'models/index.ejs'), path.join(serverPath, 'models/index.js'), templateData);

  return [
    [
      'mongo-sanitize',
      'mongoose',
    ],
    [],
    {},
  ];
}

function createSchema(that, serverPath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'schema/example.ejs'), path.join(serverPath, 'schema/example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'schema/index.ejs'), path.join(serverPath, 'schema/index.js'), templateData);

  return [
    [
      'apollo-server-express',
    ],
    [],
    {},
  ];
}

function createResolvers(that, serverPath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/example.ejs'), path.join(serverPath, 'resolvers/example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/index.ejs'), path.join(serverPath, 'resolvers/index.js'), templateData);

  return [
    [],
    [],
    {},
  ];
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

function createBasicBabel(that, serverPath) {
  copyTpl(that, path.join(globalTemplatePath, 'babel/rc/basic'), path.join(serverPath, '.babelrc'));

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
      start: `npm run build && nodemon -r dotenv/config ${path.join(serverPath, 'dist/index.js')}`,
      serve: `node -r dotenv/config ${path.join(serverPath, 'dist/index.js')}`,
    },
  ];
}

module.exports = {
  copyTpl,
  createBasicBabel,
  createModels,
  createSchema,
  createResolvers,
  basicServerDefault,
  createServerIndex,
};
