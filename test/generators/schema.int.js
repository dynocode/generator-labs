const path = require('path');

const chai = require('chai');
const yoHelp = require('yeoman-test');

chai.use(require('chai-fs'));

const { expect } = chai;

describe('yo labs:schema', () => {
  const schemaGenPath = path.join(__dirname, '../../', 'generators', 'schema');
  describe('basic new schema', () => {
    const schemaName = 'test-file';
    let resultDirPath;
    before('run generator', async () => {
      resultDirPath = await yoHelp.run(schemaGenPath)
        .withOptions({
          schemaName,
        })
        .withPrompts({
          modelDir: './src/models',
          schemaDir: './src/schema',
          importExport: true,
          baseModel: false,
          modelBasedOnSchema: false,
        });
    });

    it('should create a new schema file from scratch', async () => {
      const srcDir = path.join(resultDirPath, 'src');
      const schemaDir = path.join(srcDir, 'schema');
      expect(resultDirPath).to.be.a.directory();
      expect(srcDir).to.be.a.directory();
      expect(schemaDir).to.be.a.directory().with.files([
        `${schemaName}.js`,
        'index.js',
      ]);
    });
    // it('should install deps', async () => {

    // });
    // TODO: do some validation on files created;
  });
});
