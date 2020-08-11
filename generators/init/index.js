const Generator = require('yeoman-generator');

const { defaultFilePaths, template } = require('../../lib/template');

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
        default: false,
      },
    ]);
  }

  async importRequirePrompt() {
    if (this.answer.useBabel) {
      const useImport = await this.prompt([
        {
          type: 'confirm',
          name: 'useBabel',
          message: 'Use import/export?',
          default: false,
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
    };
    if (this.answer && this.answer.serverClient) {
      ctx.serverPath = './server';
      ctx.srcPath = './server/src';
    }
    Object.assign(this.ctx, ctx);
  }

  addBoilerplate() {
    template.copyTpl(this, defaultFilePaths.dockerCompose, 'docker-compose.yaml');
    template.copyTpl(this, defaultFilePaths.gitignore, '.gitignore');
    template.copyTpl(this, defaultFilePaths.readme, 'README.md');
    template.copyTpl(this, defaultFilePaths.editorconfig, '.editorconfig');
  }

  addServer() {
    const { ctx } = this;
    const [basicProdDeps, basicDevDeps, basicScripts] = template
      .basicServerDefault(this, ctx.serverPath);

    this.deps.prod.push(...basicProdDeps);
    this.deps.dev.push(...basicDevDeps);
    Object.assign(this.pkgScripts, basicScripts);

    const [modelsProdDeps, modelsDevDeps, modelsScripts] = template
      .createModels(this, ctx.srcPath);

    this.deps.prod.push(...modelsProdDeps);
    this.deps.dev.push(...modelsDevDeps);
    Object.assign(this.pkgScripts, modelsScripts);

    const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
      .createSchema(this, ctx.srcPath);

    this.deps.prod.push(...schemaProdDeps);
    this.deps.dev.push(...schemaDevDeps);
    Object.assign(this.pkgScripts, schemaScripts);

    const [resolversProdDeps, resolversDevDeps, resolversScripts] = template
      .createResolvers(this, ctx.srcPath);

    this.deps.prod.push(...resolversProdDeps);
    this.deps.dev.push(...resolversDevDeps);
    Object.assign(this.pkgScripts, resolversScripts);

    const [indexProdDeps, indexDevDeps, indexScripts] = template
      .createServerIndex(this, ctx.srcPath);

    this.deps.prod.push(...indexProdDeps);
    this.deps.dev.push(...indexDevDeps);
    Object.assign(this.pkgScripts, indexScripts);
  }

  addBabel() {
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
