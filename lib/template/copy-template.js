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

function createDockerCompose(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.dockerCompose, 'docker-compose.yaml', templateData);
}

function createGitignore(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.gitignore, '.gitignore', templateData);
}

function createReadme(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.readme, 'README.md', templateData);
}

function createEditorconfig(that, toDirPath, templateData) {
  copyTpl(that, defaultFilePaths.editorconfig, '.editorconfig', templateData);
}

function basicServerDefault(that, serverPath, templateData) {
  const prodDeps = [];
  const devDeps = [];
  const scripts = {};

  copyTpl(that, defaultFilePaths.readme, 'README.md');

  // Lint
  const [lintProdDeps, lintDevDeps, lintScripts] = createLint(that, serverPath, templateData);
  prodDeps.push(lintProdDeps);
  devDeps.push(lintDevDeps);
  Object.assign(scripts, lintScripts);

  // ENV
  copyTpl(that, defaultFilePaths.env, path.join(serverPath, '.env'));
  copyTpl(that, defaultFilePaths.envDev, path.join(serverPath, '.env.dev'));
  copyTpl(that, defaultFilePaths.envTest, path.join(serverPath, '.env.test'));
  copyTpl(that, defaultFilePaths.envProd, path.join(serverPath, '.env.prod'));

  return [prodDeps, devDeps, scripts];
}

function createModels(that, serverPath, templateData) {
  const modelsDir = path.join(serverPath, 'models');
  copyTpl(that, path.join(globalTemplatePath, 'models/example.ejs'), path.join(modelsDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'models/index.ejs'), path.join(modelsDir, 'index.js'), templateData);
  that.config.set({ modelsDir });

  return [
    [
      'mongo-sanitize',
      'mongoose',
    ],
    [],
    {},
  ];
}

function createModel(that, serverPath, fileName, templateData) {
  const modelsDir = path.join(serverPath, 'models');
  copyTpl(that, path.join(globalTemplatePath, 'models/empty-model.ejs'), path.join(modelsDir, `${fileName}.js`), templateData);

  return [[], [], {}];
}

function createSchema(that, serverPath, templateData) {
  const schemaDir = path.join(serverPath, 'schema');
  copyTpl(that, path.join(globalTemplatePath, 'schema/example.ejs'), path.join(schemaDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'schema/index.ejs'), path.join(schemaDir, 'index.js'), templateData);

  that.config.set({ schemaDir });

  return [
    [
      'apollo-server-express',
    ],
    [],
    {},
  ];
}

function createNewSchema(that, serverPath, fileName, templateData) {
  const schemaDir = path.join(serverPath, 'schema');
  copyTpl(that, path.join(globalTemplatePath, 'schema/empty-schema.ejs'), path.join(schemaDir, `${fileName}.js`), templateData);

  return [[], [], {}];
}

function createResolvers(that, serverPath, templateData) {
  const resolversDir = path.join(serverPath, 'resolvers');
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/example.ejs'), path.join(resolversDir, 'example.js'), templateData);
  copyTpl(that, path.join(globalTemplatePath, 'resolvers/index.ejs'), path.join(resolversDir, 'index.js'), templateData);

  that.config.set({ resolversDir });

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
  createLint,
  createModels,
  createSchema,
  createResolvers,
  basicServerDefault,
  createServerIndex,
  createDockerCompose,
  createGitignore,
  createReadme,
  createEditorconfig,
  createModel,
  createNewSchema,
};
