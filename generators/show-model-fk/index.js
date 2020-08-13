const path = require('path');

const Generator = require('yeoman-generator');
const { getAllFKFromAllModels, getDef } = require('../../lib/model');

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

  getContext() {
    const ctx = this.config.getAll();
    Object.assign(this.ctx, ctx);
  }

  printFk() {
    // TODO: get model dir path from context, or ask user for the path;
    const modelDir = path.join(this.contextRoot, 'src/models');
    const modelsDef = getDef(modelDir);
    const fks = getAllFKFromAllModels(modelsDef);
    this.log(fks);
  }
};
