const path = require('path');
const prettier = require('prettier');

const Generator = require('../../lib/generator/base');
const { readFile, writeFile } = require('../../lib/fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument('filePath', { required: false });
    this.argument('relativePath', { required: false });

    this.option('isDir');

    this.option('relToModel');
    this.option('relToSchema');
    this.option('relToResolver');

    this.required = ['modelDir', 'schemaDir', 'resolverDir', 'importExport'];

    this.isFile = false;
    this.isDir = false;

    this.formatPath = '';
  }

  async init() {
    await this.resolveRequired();
    if (!this.options.relativePath && !this.options.filePath) {
      this.log.error('One and only One of the arguments: relativePath, filePath. Is required');
      process.exit(1);
    }
    if (this.options.relativePath && this.options.filePath) {
      this.log.error('One and only One of the arguments: relativePath, filePath. Is required');
      process.exit(1);
    }
  }

  buildFormatContext() {
    this.isDir = this.options.isDir;
    this.isFile = !this.isDir;

    if (this.options.relativePath) {
      const rels = [
        this.options.relToModel,
        this.options.relToSchema,
        this.options.relToResolver,
      ].filter((item) => !!item);
      if (rels.length < 1) {
        this.log.error('Path is relative, relative to is not supplied');
        this.log.error('Missing arg: can be one of: relToModel, relToSchema, relToResolver');
        process.exit(1);
      }
      if (rels.length > 1) {
        this.log.error('Path is relative, Cant be relative to more then one path');
        this.log.error('To many args: can be one of: relToModel, relToSchema, relToResolver');
        process.exit(1);
      }
      if (this.options.relToModel) {
        this.formatPath = path.join(this.ctx.modelDir, this.options.relativePath);
      }
      if (this.options.relToSchema) {
        this.formatPath = path.join(this.ctx.schemaDir, this.options.relativePath);
      }
      if (this.options.relToResolver) {
        this.formatPath = path.join(this.ctx.resolverDir, this.options.relativePath);
      }
    }
    if (this.options.filePath) {
      this.formatPath = this.options.filePath;
    }
  }

  async formatFiles() {
    if (this.isDir) {
      this.log('Formatting a dir is not yet supported');
    }
  }

  async formatFile() {
    if (this.isFile) {
      this.log(`Formatting file: ${this.formatPath}`);
      const file = (await readFile(this.formatPath)).toString('utf8');
      const formatted = prettier.format(file, {
        semi: true,
        singleQuote: true,
        parser: 'babel',
      });
      await writeFile(this.formatPath, formatted);
    }
  }
};
