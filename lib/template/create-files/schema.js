const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createSchema(that, schemaFilePath, indexFilePath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'schema/example.ejs'), schemaFilePath, templateData);
  copyTpl(that, path.join(globalTemplatePath, 'schema/index.ejs'), indexFilePath, templateData);

  return [
    [
      'apollo-server-express',
    ],
    [],
    {},
  ];
}

function createNewSchema(that, schemaFilePath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'schema/empty-schema.ejs'), schemaFilePath, templateData);

  return [[], [], {}];
}

function createNewSchemaWithDef(that, schemaFilePath, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'schema/with-def.ejs'), schemaFilePath, templateData);

  return [[], [], {}];
}

module.exports = {
  createSchema,
  createNewSchema,
  createNewSchemaWithDef,
};
