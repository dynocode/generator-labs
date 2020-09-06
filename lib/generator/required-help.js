const keyMap = {
  'paths.server': 'serverPath',
  'paths.src': 'srcPath',
  'paths.model': 'modelPath',
  'paths.schema': 'schemaPath',
  'paths.resolver': 'resolverPath',
};

function requiredDataMissing(requireList, ctx) {
  if (requireList.length < 1) {
    return [];
  }
  return requireList.filter((item) => {
    const key = keyMap[item] || item;
    return !ctx[key];
  });
}

function resolveRequired(that) {
  
}

module.exports = {
  requiredDataMissing,
};
