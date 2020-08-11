const Generator = require('yeoman-generator');

const { template } = require('../../lib/template');

/**
 * Add Lint to a project
 */
module.exports = class extends Generator {
  addLint() {
    template.createEditorconfig(this, './');
  }
};
