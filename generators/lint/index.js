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
  }

  addLint() {
    const [lintProdDeps, lintDevDeps, lintScripts] = template
      .createLint(this, './');

    this.config.set({ haveLint: true });

    this.deps.prod.push(...lintProdDeps);
    this.deps.dev.push(...lintDevDeps);
    Object.assign(this.pkgScripts, lintScripts);
  }

  install() {
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
};
