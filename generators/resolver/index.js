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
    this.argument('resolverName', { type: String, desc: 'name of the file and the resolver', required: false });
  }

  getContext() {
    const ctx = this.config.getAll();
    Object.assign(this.ctx, ctx);
  }

  setUpResolvers() {
    const { ctx } = this;
    if (!ctx.resolversDir) {
      this.log.info('Resolvers not set up, setting up now... /n');
      const [resolverProdDeps, resolverDevDeps, resolverScripts] = template
        .createResolvers(this, ctx.srcPath || './src', {
          importExport: ctx.importExport || true,
        });

      this.deps.prod.push(...resolverProdDeps);
      this.deps.dev.push(...resolverDevDeps);
      Object.assign(this.pkgScripts, resolverScripts);
    }
  }

  newResolver() {
    const { ctx } = this;
    if (ctx.resolversDir) {
      this.log('Resolvers already set up, creating new resolver... \n');
      if (!this.options.resolverName) {
        this.log.error('Missing resolver name: yo labs:resolver [name] \n');
        this.log(this.help());
        process.exit(1);
      }
      const fileName = this.options.resolverName
        .trim()
        .toLowerCase();

      const resolverName = fileName.split('-').map((item) => {
        const firstChar = item.substring(0, 1).toUpperCase();
        return `${firstChar}${item.substring(1)}`;
      }).join('');

      const [resolverProdDeps, resolverDevDeps, resolverScripts] = template
        .createNewResolver(this, ctx.srcPath || './src', fileName, {
          importExport: ctx.importExport || true,
          name: resolverName,
        });

      this.deps.prod.push(...resolverProdDeps);
      this.deps.dev.push(...resolverDevDeps);
      Object.assign(this.pkgScripts, resolverScripts);
    }
  }

  install() {
    const { ctx } = this;
    if (!ctx.resolversDir) {
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
