const Generator = require('yeoman-generator');

/**
 * Add editorconfig to a project
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('.editorconfig'),
      this.destinationPath('.editorconfig'),
    );
  }
};