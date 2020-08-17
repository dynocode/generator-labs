const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

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

function createNewSchemaWithDef(that, schemaPath, fileName, templateData) {
  copyTpl(that, path.join(globalTemplatePath, 'schema/with-def.ejs'), path.join(schemaPath, `${fileName}.js`), templateData);

  return [[], [], {}];
}

module.exports = {
  createSchema,
  createNewSchema,
  createNewSchemaWithDef,
};
