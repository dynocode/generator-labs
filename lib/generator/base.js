const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.deps = {
      dev: [],
      prod: [],
    };
    this.pkgScripts = {};
    this.ctx = this.config.getAll();
    this.required = [];
    this.ctxDataTypes = {
      serverPath: {
        type: 'string',
        message: 'Path to server dir?',
        default: './',
      },
      srcPath: {
        type: 'string',
        message: 'Path to src dir?',
        default: './src',
      },
      useBabel: {
        type: 'boolean',
        message: 'Use babel?',
        default: true,
      },
      importExport: {
        type: 'boolean',
        message: 'Use import/export?',
        default: true,
      },
      modelsDir: {
        type: 'string',
        message: 'Path to model dir?',
        default: './models',
      },
      schemaDir: {
        type: 'string',
        message: 'Path to schema dir?',
        default: './schema',
      },
      resolversDir: {
        type: 'string',
        message: 'Path to resolver dir?',
        default: './resolvers',
      },
    };
  }

  async resolveRequired() {
    if (this.required.length >= 1) {
      const ask = this.required
        .filter((item) => !this.ctx[item])
        .map((item) => {
          const { type, message, default: defaultValue } = this.ctxDataTypes[item];
          if (!type) {
            throw new Error(`Undefined type for required value: ${item}. Add it to this.ctxDataTypes.${item} = { type: 'string|boolean'}`);
          }
          if (!message) {
            throw new Error(`Undefined message for required value: ${item}. Add it to this.ctxDataTypes.${item} = { message: 'eg. Use babel?'}`);
          }
          if (type === 'string') {
            return {
              type: 'input',
              name: item,
              message,
              default: defaultValue,
            };
          }
          if (type === 'boolean') {
            return {
              type: 'confirm',
              name: item,
              message,
              default: defaultValue,
            };
          }
          throw new Error('Invalid type on required property.');
        });
      this.answer = await this.prompt(ask);
      Object.assign(this.ctx, this.answer);
      this.config.set(this.ctx);
    }
  }
};
