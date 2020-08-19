const Generator = require('../../lib/generator/base');
const { updateModelIndex, updateSchemaIndex, updateResolverIndex } = require('../../lib/AST/index-file');

/**
 * I needed to do this in a new function, instead of where the new files are created
 * It reads the file system to update the index, and the file system yo uses, is in mem
 * It is not worth the time to make a work around
 *
 * The lab: cli wil handle it. so that the user do not have to think about it.
 */
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('model');
    this.option('schema');
    this.option('resolver');
    this.required = ['modelDir', 'schemaDir', 'resolverDir', 'importExport'];
  }

  async init() {
    await this.resolveRequired();
  }

  async updateIndex() {
    if (this.options.model) {
      await updateModelIndex(this.ctx.modelDir, this.ctx);
    }
    if (this.options.schema) {
      await updateSchemaIndex(this.ctx.schemaDir, this.ctx);
    }
    if (this.options.resolver) {
      await updateResolverIndex(this.ctx.resolverDir, this.ctx);
    }
  }
};
