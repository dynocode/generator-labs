const path = require('path');

const Generator = require('../../lib/generator/base');

const { template } = require('../../lib/template');
const { getFilePathToAllFilesInDir } = require('../../lib/fs');
const { getAstFromCode, schemaAst } = require('../../lib/AST');

/**
 * Add Lint to a project
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.required = ['modelDir', 'schemaDir', 'resolverDir', 'importExport'];
    this.argument('resolverName', { type: String, desc: 'name of the file and the resolver', required: false });
    this.schemaBasePath = '';
    this.isNewResolver = true;
  }

  async init() {
    await this.resolveRequired();
    if (!this.options.resolverName && !this.ctx.haveResolver) {
      this.isNewResolver = false;
    }
  }

  setUpResolvers() {
    const { ctx } = this;
    if (!ctx.haveResolver) {
      this.log.info('Resolvers not set up, setting up now... /n');
      const [resolverProdDeps, resolverDevDeps, resolverScripts] = template
        .createResolvers(this, ctx.srcPath || './src', {
          importExport: ctx.importExport || true,
        });
      this.config.set({ haveResolver: true });
      this.deps.prod.push(...resolverProdDeps);
      this.deps.dev.push(...resolverDevDeps);
      Object.assign(this.pkgScripts, resolverScripts);
    }
  }

  async baseResolverOnSchemaAsk() {
    if (this.isNewResolver) {
      const ask = {
        type: 'confirm',
        name: 'resolverBasedOnSchema',
        message: 'Use schema as base?',
        default: true,
      };
      this.useSchemaAsBase = (await this.prompt([ask])).resolverBasedOnSchema;
    }
  }

  async getResolverSchemaBase() {
    if (this.useSchemaAsBase && this.isNewResolver) {
      const schemaFilesFullPaths = await getFilePathToAllFilesInDir(this.ctx.schemaDir);
      const schemaFileNames = schemaFilesFullPaths.map((item) => item.replace(this.ctx.schemaDir, ''));
      let matchInput;
      if (this.options.resolverName) {
        matchInput = schemaFileNames.find((item) => {
          const name = item.replace('.js', '').replace('/', '');
          if (this.options.schemaName === name) {
            return true;
          }
          return false;
        });
      }
      const ask = {
        type: 'list',
        name: 'baseSchema',
        message: 'What schema to base resolver on?',
        choices: schemaFileNames,
      };

      if (matchInput) {
        ask.default = matchInput;
      }

      this.schemaAsk = await this.prompt([ask]);
      this.schemaBasePath = path.join(this.ctx.schemaDir, this.schemaAsk.baseSchema);
    }
  }

  getBaseSchema() {
    if (!this.useSchemaAsBase || !this.schemaBasePath || !this.isNewResolver) {
      return null;
    }
    const file = this.fs.read(this.schemaBasePath);
    const astRes = getAstFromCode(file);
    const schemaDef = schemaAst.getFunctionNamesFromAst(astRes);
    return template.createNewResolverWithDef(
      this,
      this.ctx.resolverDir,
      this.options.resolverName,
      {
        ...this.ctx,
        ...schemaDef,
      },
    );
  }

  newResolver() {
    const { ctx } = this;
    if (!this.useSchemaAsBase && this.isNewResolver) {
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
