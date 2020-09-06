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
    this.argument('name', { type: String, desc: 'name of the file and the schema', required: false });
    this.required = ['modelDir', 'schemaDir', 'importExport'];
    this.modelBasePath = '';
    this.isNewFile = true;
  }

  async init() {
    await this.resolveRequired();
    this.getNewFileMeta(this.ctx.schemaDir);
    if (!this.options.name && !this.ctx.haveSchema) {
      this.isNewFile = false;
    }
  }

  /**
   * Init schema if not already exists in project
   * Defaults to create an example.js schema file.
   */
  setUpSchema() {
    const { ctx } = this;
    if (!ctx.haveSchema) {
      this.log.info('Schema not set up, setting up now... /n');
      const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
        .createSchema(this, this.newFilePath, this.indexFilePath, {
          importExport: ctx.importExport || true,
        });
      this.config.set({ haveSchema: true });
      this.deps.prod.push(...schemaProdDeps);
      this.deps.dev.push(...schemaDevDeps);
      Object.assign(this.pkgScripts, schemaScripts);
    }
  }

  /**
   * Ask the user if the schema should be based on a model.
   */
  async baseSchemaOnModelAsk() {
    if (this.isNewFile && this.ctx.haveModel) {
      const ask = {
        type: 'confirm',
        name: 'modelBasedOnSchema',
        message: 'Use a model as base?',
        default: true,
      };
      this.useModelAsBase = (await this.prompt([ask])).modelBasedOnSchema;
    }
  }

  /**
   * Get the model to base the schema on.
   */
  async getSchemaModelBase() {
    if (this.useModelAsBase && this.isNewFile) {
      const modelFilesFullPath = await getFilePathToAllFilesInDir(this.ctx.modelDir);
      const modelFileNames = modelFilesFullPath.map((item) => item.replace(this.ctx.modelDir, ''));
      let matchInput;
      if (this.options.name) {
        matchInput = modelFileNames.find((item) => {
          const name = item.replace('.js', '').replace('/', '');
          if (this.options.name === name) {
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

  /**
   * Create a schema based on a model
   */
  getBaseModel() {
    if (!this.useModelAsBase || !this.modelBasePath || !this.isNewFile) {
      return null;
    }
    const modelPath = this.modelBasePath;
    const file = this.fs.read(modelPath);
    const astRes = ast.getAstFromCode(file);
    const modelDef = ast.mongo.getModelDefFromAst(astRes);
    const schemaData = createSchemaFromModelDef(modelDef);
    const query = Object.values(schemaData.query).join('\n');
    const mutations = Object.values(schemaData.mutations).join('\n');
    return template.createNewSchemaWithDef(this, this.newFilePath, {
      ...this.ctx,
      query,
      mutations,
      typeDef: schemaData.typeDef,
    });
  }

  /**
   * Create a boilerplate schema file
   */
  newSchema() {
    const { ctx } = this;
    if (!this.useModelAsBase && this.isNewFile) {
      if (!this.options.name) {
        this.log.error('Missing schema name: yo labs:schema [name] \n');
        this.log(this.help());
        process.exit(1);
      }
      const fileName = this.options.name
        .trim()
        .toLowerCase();

      const name = fileName.split('-').map((item) => {
        const firstChar = item.substring(0, 1).toUpperCase();
        return `${firstChar}${item.substring(1)}`;
      }).join('');

      const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
        .createNewSchema(this, this.newFilePath, {
          importExport: ctx.importExport || true,
          name,
        });

      this.deps.prod.push(...schemaProdDeps);
      this.deps.dev.push(...schemaDevDeps);
      Object.assign(this.pkgScripts, schemaScripts);
    }
  }

  /**
   * Format the new file(s)
   */
  async format() {
    await formatVMemFile(this, this.newFilePath);
  }

  /**
   * Assemble the package.json file based on the context
   */
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
