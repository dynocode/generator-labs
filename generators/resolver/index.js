const path = require('path');

const Generator = require('../../lib/generator/base');

const { template } = require('../../lib/template');
const { getFilePathToAllFilesInDir } = require('../../lib/fs');
const { getAstFromCode, schemaAst } = require('../../lib/AST');
const { formatVMemFile } = require('../../lib/format');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.required = ['srcPath', 'modelDir', 'schemaDir', 'resolverDir', 'importExport'];
    this.argument('name', { type: String, desc: 'name of the file and the resolver', required: false });

    this.schemaBasePath = '';

    this.isNewFile = true;
    this.newResolverName = '';
  }

  async init() {
    await this.resolveRequired();
    this.getNewFileMeta(this.ctx.resolverDir);
    if (!this.options.name && !this.ctx.haveResolver) {
      this.isNewFile = false;
    }
  }

  setUpResolvers() {
    const { ctx } = this;
    if (!ctx.haveResolver) {
      this.log.info('Resolvers not set up, setting up now... /n');
      const [resolverProdDeps, resolverDevDeps, resolverScripts] = template
        .createResolvers(this, this.newFilePath, this.indexFilePath, {
          importExport: ctx.importExport || true,
        });
      this.config.set({ haveResolver: true });
      this.deps.prod.push(...resolverProdDeps);
      this.deps.dev.push(...resolverDevDeps);
      Object.assign(this.pkgScripts, resolverScripts);
    }
  }

  async baseResolverOnSchemaAsk() {
    if (this.isNewFile) {
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
    if (this.useSchemaAsBase && this.isNewFile) {
      const schemaFilesFullPaths = await getFilePathToAllFilesInDir(this.ctx.schemaDir);
      const schemaFileNames = schemaFilesFullPaths.map((item) => item.replace(this.ctx.schemaDir, ''));
      let matchInput;
      if (this.options.name) {
        matchInput = schemaFileNames.find((item) => {
          const name = item.replace('.js', '').replace('/', '');
          if (this.options.name === name) {
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
    if (!this.useSchemaAsBase || !this.schemaBasePath || !this.isNewFile) {
      return null;
    }
    const file = this.fs.read(this.schemaBasePath);
    const astRes = getAstFromCode(file);
    this.schemaDef = schemaAst.getFunctionNamesFromAst(astRes);

    this.newResolverName = this.options.name;
    return this.schemaDef;
  }

  createResolverMeta() {
    const fileName = this.options.name
      .trim()
      .toLowerCase();
    this.newResolverName = fileName;

    this.resolverFnName = this.newResolverName.split('-').map((item) => {
      const firstChar = item.substring(0, 1).toUpperCase();
      return `${firstChar}${item.substring(1)}`;
    }).join('');

    this.fileType = 'js'; // TODO: ts;
    this.fileName = `${this.newResolverName}.${this.fileType}`;
    this.newResolverPath = path.join(this.ctx.srcPath, 'resolvers', this.fileName);
  }

  createResolverFromSchemaDef() {
    if (this.schemaDef) {
      template.createNewResolverWithDef(
        this,
        this.newFilePath,
        {
          ...this.ctx,
          ...this.schemaDef,
        },
      );
    }
  }

  newResolver() {
    const { ctx } = this;
    if (!this.useSchemaAsBase && this.isNewFile) {
      this.log('Resolvers already set up, creating new resolver... \n');
      if (!this.options.name) {
        this.log.error('Missing resolver name: yo labs:resolver [name] \n');
        this.log(this.help());
        process.exit(1);
      }

      const [resolverProdDeps, resolverDevDeps, resolverScripts] = template
        .createNewResolver(this, this.newFilePath, {
          importExport: ctx.importExport || true,
          name: this.resolverFnName,
        });

      this.deps.prod.push(...resolverProdDeps);
      this.deps.dev.push(...resolverDevDeps);
      Object.assign(this.pkgScripts, resolverScripts);
    }
  }

  initTest() {
    this.testSetup();
  }

  createTestData() {
    // TODO: should create test with out schema too;
    if (this.schemaDef) {
      const filePath = path.join(this.ctx.resolverDir, this.fileName);

      this.resolverFullPath = filePath;
      this.resolverFileName = this.fileName;

      this.resolverTestPath = path.join(this.ctx.resolverDir, 'test');

      this.tests = [];

      const specTestFileName = `${this.newResolverName}.spec.${this.fileType}`;

      const relativePathToResolver = this.newResolverPath
        .replace(path.join(this.ctx.srcPath, 'resolvers/'), '../')
        .replace('.js', '');

      const spec = {
        type: 'spec',
        path: this.resolverTestPath,
        fileName: this.newResolverName,
        filePath: path.join(this.resolverTestPath, specTestFileName),
        template: {
          importExport: this.ctx.importExport,
          relativePathToResolver,
          resolverName: this.newResolverName,
          schemaDef: this.schemaDef,
        },
      };

      this.tests.push(spec);
    }
  }

  createTestFiles() {
    if (this.tests) {
      this.tests.forEach((item) => {
        template.test.createResolverSpecTest(this, item.path, item.fileName, item.template);
      });
    }
  }

  async format() {
    await formatVMemFile(this, this.newFilePath);
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
