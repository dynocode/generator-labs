const path = require('path');
const Generator = require('../../lib/generator/base');

const { template } = require('../../lib/template');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.required = [
      'appName',
      'serverPath',
      'srcPath',
      'modelDir',
      'schemaDir',
      'resolverDir',
      'useBabel',
      'importExport',
    ];
  }

  async init() {
    await this.resolveRequired();
  }

  meta() {
    this.schemaExampleFilePath = path.join(this.ctx.schemaDir, 'example.js');
    this.schemaIndexFilePath = path.join(this.ctx.schemaDir, 'index.js');

    this.resolverExampleFilePath = path.join(this.ctx.resolverDir, 'example.js');
    this.resolverIndexFilePath = path.join(this.ctx.resolverDir, 'index.js');
  }

  addMinimumBoilerplate() {
    const { ctx } = this;

    template.createDockerCompose(this, './');
    template.createGitignore(this, './');
    template.createReadme(this, './');
    template.createEditorconfig(this, './');

    const [basicProdDeps, basicDevDeps, basicScripts] = template
      .basicServerDefault(this, ctx.serverPath);

    this.config.set({ haveLint: true });

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
    this.config.set({ haveModel: true });
    this.deps.prod.push(...modelsProdDeps);
    this.deps.dev.push(...modelsDevDeps);
    Object.assign(this.pkgScripts, modelsScripts);
  }

  initGqlSchema() {
    const { ctx } = this;
    const [schemaProdDeps, schemaDevDeps, schemaScripts] = template
      .createSchema(this, this.schemaExampleFilePath, this.schemaIndexFilePath, {
        importExport: ctx.importExport,
      });
    this.config.set({ haveSchema: true });
    this.deps.prod.push(...schemaProdDeps);
    this.deps.dev.push(...schemaDevDeps);
    Object.assign(this.pkgScripts, schemaScripts);
  }

  initGqlResolver() {
    const { ctx } = this;
    const [resolversProdDeps, resolversDevDeps, resolversScripts] = template
      .createResolvers(this, this.resolverExampleFilePath, this.resolverIndexFilePath, {
        importExport: ctx.importExport,
      });
    this.config.set({ haveResolver: true });
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
    if (ctx.useBabel) {
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
      name: this.ctx.appName,
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
