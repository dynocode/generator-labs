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

module.exports = {
  init: initTest,
};
