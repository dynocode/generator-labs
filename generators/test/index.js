const path = require('path');

const Generator = require('../../lib/generator/base');
const { test } = require('../../lib/template');
const fs = require('../../lib/fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('file', { type: String, desc: 'The file path of the file to test', required: false });
    this.argument('testDir', { type: String, desc: 'The directory to create the test file in', required: false });
    this.argument('type', { type: String, desc: 'The type of test: spec or int, default to spec', required: false });
    this.argument('name', { type: String, desc: 'The name of test file: only used if no file is given (--file)', required: false });
    this.required = ['importExport'];

    this.name = '';
    this.validFileToTest = false;
    this.fileToTest = '';
    this.fileToTestFullPath = '';
    this.testDirPath = '';
    this.testFileName = '';
    this.testType = '';
    this.testExtension = '';
    this.relativePathToFileToTest = '';
  }

  async init() {
    await this.resolveRequired();
    this.testDirPath = this.options.testDir;
    this.testType = this.options.type || 'spec';
    this.fileToTest = this.options.file;
    this.name = this.options.name;
    if (this.fileToTest) {
      this.fileToTestFullPath = path.join(this.contextRoot, this.fileToTest);
    }
  }

  // Set up test suite if non exists;
  setUpTests() {
    const { haveTest } = this.ctx;
    if (!haveTest) {
      const [testProd, testDev, testScript] = test
        .createBasicSuite(this, this.contextRoot, this.ctx);
      this.deps.prod.push(...testProd);
      this.deps.dev.push(...testDev);
      Object.assign(this.pkgScripts, testScript);
      this.config.set('haveTest', true);
    }
  }

  async resolveFileToTest() {
    if (this.fileToTest) {
      const checkFileExists = await fs.exists(this.fileToTest);
      if (!checkFileExists) {
        this.validFileToTest = false;
        this.log.error(`NOT FOUND: File at path: ${this.fileToTestFullPath}, does not exist.`);
        process.exit(1);
      }
      this.validFileToTest = true;
    }
  }

  setTestPaths() {
    const extension = this.fileToTest ? path.extname(this.fileToTest) : '.js';
    this.testFileName = this.fileToTest ? path.basename(this.fileToTest, extension) : this.name;
    this.testExtension = extension;

    this.testDirPath = this.testDirPath ? this.testDirPath : `${this.contextRoot}/test`;
    this.testFilePath = `${this.testDirPath}/${this.testFileName}.${this.testType}${this.testExtension}`;

    if (this.fileToTestFullPath) {
      this.relativePathToFileToTest = path.relative(this.testDirPath, this.fileToTestFullPath);
    }
  }

  async createTestFile() {
    const templateCtx = {
      ...this.ctx,
      fileName: this.testFileName,
      pathToFile: this.relativePathToFileToTest || '',
    };
    const [testProd, testDev, testScript] = await test
      .createBasicTestFile(this, this.testFilePath, templateCtx);

    this.deps.prod.push(...testProd);
    this.deps.dev.push(...testDev);
    Object.assign(this.pkgScripts, testScript);
  }

  install() {
    if (this.deps.prod.length > 0
      || this.deps.dev.length > 0
      || Object.keys(this.pkgScripts).length > 0) {
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
