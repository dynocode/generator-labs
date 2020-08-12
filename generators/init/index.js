const Generator = require('yeoman-generator');

const { template } = require('../../lib/template');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.deps = {
      dev: [],
      prod: [],
    };
    this.pkgScripts = {};
    this.ctx = {};
  }

  async prompting() {
    this.answer = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname,
      },
      {
        type: 'list',
        name: 'language',
        message: 'Select language',
        choices: [
          'JS',
          'TS',
        ],
      },
      {
        type: 'list',
        name: 'runtime',
        message: 'Select runtime',
        choices: [
          'Node',
          'Deno',
        ],
      },
      {
        type: 'confirm',
        name: 'useBabel',
        message: 'Use Babel?',
        default: true,
      },
    ]);
  }

  async importRequirePrompt() {
    if (this.answer.useBabel) {
      const useImport = await this.prompt([
        {
          type: 'confirm',
          name: 'importExport',
          message: 'Use import/export?',
          default: true,
        },
      ]);
      Object.assign(this.answer, useImport);
    }
  }

  createContext() {
    // TODO: ask if server &| client
    const ctx = {
      serverPath: './',
      srcPath: './src',
      babel: this.answer.useBabel,
      importExport: this.answer.importExport || false,
    };
    if (this.answer && this.answer.serverClient) {
      ctx.serverPath = './server';
      ctx.srcPath = './server/src';
    }
    Object.assign(this.ctx, ctx);
    this.config.set(ctx);
  }

  addMinimumBoilerplate() {
    const { ctx } = this;

    template.createDockerCompose(this, './');
    template.createGitignore(this, './');
    template.createReadme(this, './');
    template.createEditorconfig(this, './');

    const [basicProdDeps, basicDevDeps, basicScripts] = template
      .basicServerDefault(this, ctx.serverPath);

    this.deps.prod.push(...basicProdDeps);
    this.deps.dev.push(...basicDevDeps);
    Object.assign(this.pkgScripts, basicScripts);
  }

  initModels() {
    const { ctx } = this;
    const [modelsProdDeps, modelsDevDeps, modelsScripts] = template
      .createModels(this, ctx.srcPath, {
        importExport: ctx.importExport,
      });

    this.deps.prod.push(...modelsProdDeps);
    this.deps.dev.push(...modelsDevDeps);
    Object.assign(this.pkgScripts, modelsScripts);
  }

  initGqlSchema() {
    const { ctx } = this;
    const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
      .createSchema(this, ctx.srcPath, {
        importExport: ctx.importExport,
      });

    this.deps.prod.push(...schemaProdDeps);
    this.deps.dev.push(...schemaDevDeps);
    Object.assign(this.pkgScripts, schemaScripts);
  }

  initGqlResolver() {
    const { ctx } = this;
    const [resolversProdDeps, resolversDevDeps, resolversScripts] = template
      .createResolvers(this, ctx.srcPath, {
        importExport: ctx.importExport,
      });

    this.deps.prod.push(...resolversProdDeps);
    this.deps.dev.push(...resolversDevDeps);
    Object.assign(this.pkgScripts, resolversScripts);
  }

  initServer() {
    const { ctx } = this;

    const [indexProdDeps, indexDevDeps, indexScripts] = template
      .createServerIndex(this, ctx.srcPath, {
        importExport: ctx.importExport,
      });

    this.deps.prod.push(...indexProdDeps);
    this.deps.dev.push(...indexDevDeps);
    Object.assign(this.pkgScripts, indexScripts);
  }

  initBabel() {
    const { ctx } = this;
    if (ctx.babel) {
      const [prodDeps, devDeps, scripts] = template
        .createBasicBabel(this, ctx.serverPath);

      this.deps.prod.push(...prodDeps);
      this.deps.dev.push(...devDeps);
      Object.assign(this.pkgScripts, scripts);
    }
  }

  install() {
    const scripts = this.pkgScripts;
    const pkgJson = {
      name: this.answer.name,
      version: '1.0.0',
      scripts: {
        ...scripts,
      },
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    this.npmInstall(this.deps.prod, { 'save-dev': false });
    this.npmInstall(this.deps.dev, { 'save-dev': true });
  }
};
