const { createBasicBabel } = require('./babel');
const copyTpl = require('./copyTpl');
const { createDockerCompose } = require('./docker');
const { createEditorconfig } = require('./editor');
const { createGitignore } = require('./git');
const { createLint } = require('./lint');
const { createModels, createModel } = require('./model');
const { createReadme } = require('./readme');
const { createResolvers, createNewResolver, createNewResolverWithDef } = require('./resolver');
const { createSchema, createNewSchema, createNewSchemaWithDef } = require('./schema');
const { createServerIndex, basicServerDefault } = require('./server');
const test = require('./test');

module.exports = {
  createBasicBabel,
  copyTpl,
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
  createNewSchemaWithDef,
  createNewResolver,
  createNewResolverWithDef,
  test,
};
