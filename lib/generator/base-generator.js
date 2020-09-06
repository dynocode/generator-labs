const path = require('path');

const Generator = require('yeoman-generator');

const requireHelp = require('./required-help');

/**
 * Should do:
 * 1. Handle context creation
 * 2. checking that the context have the minimal amount of data
 * 3. ask the user for data that is needed for task X
 * 4. be the authority of inputs
 *  4.1. if a gen need a name for a file, how should that name be asked for, what about 2 names
 */

const ctxDataTypesOrg = {
  'paths.server': {
    type: 'string',
    message: 'Path to server dir?',
    default: './',
  },
  'paths.src': {
    type: 'string',
    message: 'Path to src dir?',
    default: './src',
  },
  'paths.model': {
    type: 'string',
    message: 'Path to model dir?',
    default: './src/models',
  },
  'paths.schema': {
    type: 'string',
    message: 'Path to schema dir?',
    default: './src/schema',
  },
  'paths.resolver': {
    type: 'string',
    message: 'Path to resolver dir?',
    default: './src/resolvers',
  },
  'appName': {
    type: 'string',
    message: 'Your project name',
    default: this.appname,
  },
  'useBabel': {
    type: 'boolean',
    message: 'Use babel?',
    default: true,
  },
  'importExport': {
    type: 'boolean',
    message: 'Use import/export?',
    default: true,
  },
  'language': {
    type: 'list',
    message: 'Select language',
    choices: [
      'JS',
      'TS',
    ],
  },
  'runtime': {
    type: 'list',
    message: 'Select runtime',
    choices: [
      'Node',
      'Deno',
    ],
  },
};

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    const lab = {};
    const ctx = this.config.getAll();
    Object.assign(lab, {
      ctx,
      deps: {
        dev: [],
        prod: [],
      },
      pkgScripts: {},
      required: [],
      ctxDataTypes: ctxDataTypesOrg,
    });
    this._lab_internal = lab;
  }

  required(required) {
    this._lab_internal.required.push(...required);
  }

  async resolveRequired() {
    const { ctx, required, ctxDataTypes } = this._lab_internal;
    const requiredDataMissing = requireHelp.requiredDataMissing(required, ctx);

    const ask = requiredDataMissing.map((item) => {
      const { type, message, default: defaultValue } = ctxDataTypes[item];
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
      if (type === 'list') {
        return {
          type: 'list',
          name: item,
          message,
          default: defaultValue,
        };
      }
      throw new Error(`Invalid type: ${type} on required property.`);
    });
    const answer = await this.prompt(ask);
    const qPaths = answer.paths;
    if (qPaths) {
      const allP = Object.entries(qPaths).map(([name, value]) => {
        const fullPath = path.join(this.contextRoot, value);
        return [`${name}Path`, fullPath];
      });
      delete answer.paths;
      Object.assign(answer, Object.fromEntries(allP));
    }
    Object.assign(this._lab_internal.ctx, answer);
    this.config.set(this._lab_internal.ctx);
  }

  setContext(data) {
    // Is object?
    Object.assign(this._lab_internal.ctx, data);
    this.config.set(this._lab_internal.ctx);
  }
};
