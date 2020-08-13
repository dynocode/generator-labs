/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
const modelAst = require('../AST/mongo-model');

function getDef(modelDirPath) {
  const ast = modelAst.getAstForAllModels(modelDirPath);
  return modelAst.getModelDefsFromAsts(ast);
}

function getAllFKFromAllModels(def) {
  const entries = Object.entries(def);
  return entries.reduce((links, [name, model]) => {
    const modelValues = Object.entries(model);
    const refs = modelValues
      .filter(([key, value]) => {
        if (value.ref) {
          return true;
        }
        if (Array.isArray(value) && value[0].ref) {
          return true;
        }
        return null;
      })
      .map(([key, value]) => {
        if (value.ref) {
          return [key, value.ref];
        }
        if (Array.isArray(value)) {
          return [key, value[0].ref];
        }
        return null;
      });
    const modelLinks = Object.fromEntries(refs);
    return Object.assign(links, {
      [name]: modelLinks,
    });
  }, {});
}

module.exports = {
  getDef,
  getAllFKFromAllModels,
};
