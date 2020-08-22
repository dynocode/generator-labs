const path = require('path');

const { globalTemplatePath } = require('../file-paths');
const copyTpl = require('./copyTpl');

function createTestScripts(ctx) {
  if (ctx.useBabel) {
    return {
      'test': "env-cmd -f .env.test mocha --require @babel/register 'src/**/**.{spec,int}.js' --exit",
      'test:spec': "env-cmd -f .env.test mocha --require @babel/register 'src/**/**.spec.js' --exit",
      'test:int': "env-cmd -f .env.test mocha --require @babel/register 'src/**/**.int.js' --exit",
    };
  }
  return {
    'test': "env-cmd -f .env.test mocha 'src/**/**.{spec,int}.js' --exit",
    'test:spec': "env-cmd -f .env.test mocha 'src/**/**.spec.js' --exit",
    'test:int': "env-cmd -f .env.test mocha 'src/**/**.int.js' --exit",
  };
}

function initTest(that) {
  if (!that.ctx.testInit) {
    that.config.set({ testInit: true });

    return [
      [],
      [
        'chai',
        'env-cmd',
        'mocha',
        'sinon',
      ],
      createTestScripts(that.ctx),
    ];
  }
  return [[], [], {}];
}

function createResolverSpecTest(that, testDir, resolverFileName, templateData) {
  copyTpl(
    that,
    path.join(globalTemplatePath, 'resolvers/test/base-with-def.spec.ejs'),
    path.join(testDir, `${resolverFileName}.spec.js`),
    templateData,
  );
  return [[], [], {}];
}

module.exports = {
  init: initTest,
  createResolverSpecTest,
};
