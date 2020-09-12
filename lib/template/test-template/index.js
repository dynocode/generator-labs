const path = require('path');
const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('../create-files/copyTpl');

/**
 * Should be able to create different test suites
 * 1. Different runners: mocha, jest
 * 2. Should be able to use TS and JS
 * 3. Should be able to use babel
 * 4. Should be able to run with envs
 * 5. Should be able to run int tests, on instance of server
 *  5.1. Only need to support gql server with mongo, for now.
 */

function createBasicSuite(that, testPath, templates) {
  const env = 'env-cmd -f .env.test';
  const babel = '--require @babel/register';
  // TODO: do smarter use of the path string, how to define where tests are?
  const runner = `${env} mocha ${templates.importExport ? babel : ''}`;
  const mainRunner = `${runner} 'src/**/**.{spec,int}.js' --exit`;
  const specRunner = `${runner} 'src/**/**.spec.js' --exit`;
  const intRunner = `${runner} 'src/**/**.int.js' --exit`;

  return [
    [],
    [
      'env-cmd',
      '@babel/register',
      'mocha',
    ],
    {
      'test': mainRunner,
      'test:spec': specRunner,
      'test:int': intRunner,
    },
  ];
}

function createBasicTestFile(that, testFilePath, templates) {
  copyTpl(that, path.join(globalTemplatePath, 'test-files/basic.ejs'), testFilePath, templates);
  return [
    [],
    [
      'chai',
    ],
    {},
  ];
}

module.exports = {
  createBasicSuite,
  createBasicTestFile,
};
