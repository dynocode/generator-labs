const Generator = require('yeoman-generator');

const { template } = require('../../lib/template');

/**
 * Add Lint to a project
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.deps = {
      dev: [],
      prod: [],
    };
    this.pkgScripts = {};
    this.ctx = {};
    this.argument('modelName', { type: String, desc: 'name of the file and the model', required: false });
  }

  getContext() {
    const ctx = this.config.getAll();
    Object.assign(this.ctx, ctx);
  }

  setUpMongo() {
    const { ctx } = this;
    if (!ctx.modelDir) {
      this.log.info('Models not set up, setting up now... /n');
      const [modelsProdDeps, modelsDevDeps, modelsScripts] = template
        .createModels(this, ctx.srcPath || './src', {
          importExport: ctx.importExport || true,
        });

      this.deps.prod.push(...modelsProdDeps);
      this.deps.dev.push(...modelsDevDeps);
      Object.assign(this.pkgScripts, modelsScripts);
    }
  }

  newMongoModel() {
    const { ctx } = this;
    if (ctx.modelDir) {
      this.log('Models already set up, creating new model... \n');
      if (!this.options.modelName) {
        this.log.error('Missing model name: yo labs:model [name] \n');
        this.log(this.help());
        process.exit(1);
      }
      const fileName = this.options.modelName
        .trim()
        .toLowerCase();

      const modelName = fileName.split('-').map((item) => {
        const firstChar = item.substring(0, 1).toUpperCase();
        return `${firstChar}${item.substring(1)}`;
      }).join('');

      const [modelsProdDeps, modelsDevDeps, modelsScripts] = template
        .createModel(this, ctx.srcPath || './src', fileName, {
          importExport: ctx.importExport || true,
          name: modelName,
        });

      this.deps.prod.push(...modelsProdDeps);
      this.deps.dev.push(...modelsDevDeps);
      Object.assign(this.pkgScripts, modelsScripts);
    }
  }

  install() {
    const { ctx } = this;
    if (!ctx.modelDir) {
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
