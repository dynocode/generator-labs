const Generator = require('yeoman-generator');

/**
 * Add MongoDb to a project
 */
module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'modelPath',
        message: 'Path to models',
        default: './src/models',
      },
    ]);
  }

  writing() {
    // Ask to add `mongodb-memory-server`
    const dependencies = {
      'mongo-sanitize': '^1.1.x',
      'mongoose': '^5.9.x',
    };
    const pkgJson = {
      dependencies,
    };

    // Extend or create package.json file in destination path
    this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

    this.fs.copyTpl(
      this.templatePath('models/index.js'),
      this.destinationPath(`${this.answers.modelPath}/index.js`),
    );
  }

  install() {
    this.npmInstall();
  }
};
