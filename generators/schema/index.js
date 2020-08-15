const path = require('path');

const Generator = require('../../lib/generator/base');

const { template } = require('../../lib/template');
const { getFilePathToAllFilesInDir } = require('../../lib/fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('schemaName', { type: String, desc: 'name of the file and the schema', required: false });
    this.required = ['modelsDir', 'schemaDir'];
    this.modelBase = '';
  }

  async init() {
    await this.resolveRequired();
  }

  async baseSchemaOnModelAsk() {
    const ask = {
      type: 'confirm',
      name: 'modelBasedOnSchema',
      message: 'Use a model as base?',
      default: true,
    };
    this.useModelAsBase = (await this.prompt([ask])).modelBasedOnSchema;
  }

  async getSchemaModelBase() {
    if (this.useModelAsBase) {
      const modelFilesFullPath = await getFilePathToAllFilesInDir(this.ctx.modelsDir);
      const modelFileNames = modelFilesFullPath.map((item) => item.replace(this.ctx.modelsDir, ''));
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
      this.modelBase = path.join(this.ctx.modelsDir, this.modelAsk.baseModel);
    }
  }

  setUpSchema() {
    const { ctx } = this;
    if (!ctx.schemaDir) {
      this.log.info('Schema not set up, setting up now... /n');
      const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
        .createSchema(this, ctx.srcPath || './src', {
          importExport: ctx.importExport || true,
        });

      this.deps.prod.push(...schemaProdDeps);
      this.deps.dev.push(...schemaDevDeps);
      Object.assign(this.pkgScripts, schemaScripts);
    }
  }

  newSchema() {
    const { ctx } = this;
    if (ctx.schemaDir) {
      this.log('Schema already set up, creating new schema... \n');
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
        .createNewSchema(this, ctx.srcPath || './src', fileName, {
          importExport: ctx.importExport || true,
          name: schemaName,
        });

      this.deps.prod.push(...schemaProdDeps);
      this.deps.dev.push(...schemaDevDeps);
      Object.assign(this.pkgScripts, schemaScripts);
    }
  }

  install() {
    const { ctx } = this;
    if (!ctx.schemaDir) {
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
