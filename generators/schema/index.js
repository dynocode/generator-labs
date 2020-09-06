const path = require('path');

const Generator = require('../../lib/generator/base');

const { template } = require('../../lib/template');
const { getFilePathToAllFilesInDir } = require('../../lib/fs');
const ast = require('../../lib/AST');
const { createSchemaFromModelDef } = require('../../lib/schema');
const { formatVMemFile } = require('../../lib/format');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('schemaName', { type: String, desc: 'name of the file and the schema', required: false });
    this.required = ['modelDir', 'schemaDir', 'importExport'];
    this.modelBasePath = '';
    this.isNewModel = true;
  }

  async init() {
    await this.resolveRequired();
    if (!this.options.schemaName && !this.ctx.haveSchema) {
      this.isNewModel = false;
    }
  }

  meta() {
    this.fileExtension = '.js';
    this.indexFileName = `index${this.fileExtension}`;
    this.fileName = `${this.options.schemaName}${this.fileExtension}`;
    this.newSchemaFilePath = path.join(this.ctx.schemaDir, this.fileName);
    this.schemaIndexFilePath = path.join(this.ctx.schemaDir, this.indexFileName);
  }

  setUpSchema() {
    const { ctx } = this;
    if (!ctx.haveSchema) {
      this.log.info('Schema not set up, setting up now... /n');
      const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
        .createSchema(this, this.newSchemaFilePath, this.schemaIndexFilePath, {
          importExport: ctx.importExport || true,
        });
      this.config.set({ haveSchema: true });
      this.deps.prod.push(...schemaProdDeps);
      this.deps.dev.push(...schemaDevDeps);
      Object.assign(this.pkgScripts, schemaScripts);
    }
  }

  async baseSchemaOnModelAsk() {
    if (this.isNewModel) {
      const ask = {
        type: 'confirm',
        name: 'modelBasedOnSchema',
        message: 'Use a model as base?',
        default: true,
      };
      this.useModelAsBase = (await this.prompt([ask])).modelBasedOnSchema;
    }
  }

  async getSchemaModelBase() {
    if (this.useModelAsBase && this.isNewModel) {
      const modelFilesFullPath = await getFilePathToAllFilesInDir(this.ctx.modelDir);
      const modelFileNames = modelFilesFullPath.map((item) => item.replace(this.ctx.modelDir, ''));
      let matchInput;
      if (this.options.schemaName) {
        matchInput = modelFileNames.find((item) => {
          const name = item.replace('.js', '').replace('/', '');
          if (this.options.schemaName === name) {
            return true;
          }
          return false;
        });
      }
      const ask = {
        type: 'list',
        name: 'baseModel',
        message: 'What model to base schema on?',
        choices: modelFileNames,
      };

      if (matchInput) {
        ask.default = matchInput;
      }

      this.modelAsk = await this.prompt([ask]);
      this.modelBasePath = path.join(this.ctx.modelDir, this.modelAsk.baseModel);
    }
  }

  getBaseModel() {
    if (!this.useModelAsBase || !this.modelBasePath || !this.isNewModel) {
      return null;
    }
    const modelPath = this.modelBasePath;
    const file = this.fs.read(modelPath);
    const astRes = ast.getAstFromCode(file);
    const modelDef = ast.mongo.getModelDefFromAst(astRes);
    const schemaData = createSchemaFromModelDef(modelDef);
    const query = Object.values(schemaData.query).join('\n');
    const mutations = Object.values(schemaData.mutations).join('\n');
    return template.createNewSchemaWithDef(this, this.newSchemaFilePath, {
      ...this.ctx,
      query,
      mutations,
      typeDef: schemaData.typeDef,
    });
  }

  newSchema() {
    const { ctx } = this;
    if (!this.useModelAsBase && this.isNewModel) {
      if (!this.options.schemaName) {
        this.log.error('Missing schema name: yo labs:schema [name] \n');
        this.log(this.help());
        process.exit(1);
      }
      const fileName = this.options.schemaName
        .trim()
        .toLowerCase();

      const schemaName = fileName.split('-').map((item) => {
        const firstChar = item.substring(0, 1).toUpperCase();
        return `${firstChar}${item.substring(1)}`;
      }).join('');

      const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
        .createNewSchema(this, this.newSchemaFilePath, {
          importExport: ctx.importExport || true,
          name: schemaName,
        });

      this.deps.prod.push(...schemaProdDeps);
      this.deps.dev.push(...schemaDevDeps);
      Object.assign(this.pkgScripts, schemaScripts);
    }
  }

  async format() {
    await formatVMemFile(this, this.newSchemaFilePath);
  }

  install() {
    if (this.deps.prod.length > 0 || this.deps.dev.length > 0) {
      const scripts = this.pkgScripts;
      const pkgJson = {
        scripts: {
          ...scripts,
        },
      };

      // Extend or create package.json file in destination path
      this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
      this.npmInstall(this.deps.prod, { 'save-dev': false });
      this.npmInstall(this.deps.dev, { 'save-dev': true });
    }
  }
};
