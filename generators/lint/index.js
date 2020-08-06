const Generator = require('yeoman-generator');

/**
 * Add Lint to a project
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

  }

  writing() {
    const pkgJson = {
      devDependencies: {
        'eslint': '^7.6.x',
        'eslint-config-airbnb-base': '^14.2.x',
        'eslint-plugin-chai-friendly': '^0.6.x',
        'eslint-plugin-import': '^2.22.x',
  
      },
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

    this.fs.copyTpl(
      this.templatePath('.eslintignore'),
      this.destinationPath('.eslintignore'),
    );
    this.fs.copyTpl(
      this.templatePath('.eslintrc.js'),
      this.destinationPath('.eslintrc.js'),
    );
  }

  install() {
    this.npmInstall();
    // this.npmInstall(['eslint'], { 'save-dev': true });
    // this.npmInstall(['eslint-config-airbnb-base'], { 'save-dev': true });
    // this.npmInstall(['eslint-plugin-chai-friendly'], { 'save-dev': true });
    // this.npmInstall(['eslint-plugin-import'], { 'save-dev': true });
  } 
};