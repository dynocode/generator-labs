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
    this.argument('schemaName', { type: String, desc: 'name of the file and the schema', required: false });
  }

  getContext() {
    const ctx = this.config.getAll();
    Object.assign(this.ctx, ctx);
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
