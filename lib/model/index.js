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

function getKeyTypeEnumFromDef(modelDef) {
  const entries = Object.entries(modelDef);

  const keysTypes = entries.map(([modelName, def]) => {
    const defEntries = Object.entries(def);

    const keyType = defEntries.map(([key, params]) => {
      let typeVal = params.type;
      if (Array.isArray(params) && params[0].type) {
        typeVal = params[0].type;
      }
      return [key, typeVal || null];
    });

    const keyTypeObj = Object.fromEntries(keyType);
    return [modelName, keyTypeObj];
  });

  const res = Object.fromEntries(keysTypes);
  return res;
}

module.exports = {
  getDef,
  getAllFKFromAllModels,
  getKeyTypeEnumFromDef,
};
