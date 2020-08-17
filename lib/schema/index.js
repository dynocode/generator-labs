const mongoToGqlTypeMap = {
  'mongoose.Schema.Types.ObjectId': 'ID',
  'String': 'String',
  'Boolean': 'Boolean',
  'Number': 'Int',
  'Date': 'Date',
};

function getSchemaPropsFromModelDef(modelDef) {
  const [[name, props]] = Object.entries(modelDef);
  const schemaProps = Object.entries(props)
    .map(([key, keyProps]) => {
      let { type, required } = keyProps;
      let gqlType = mongoToGqlTypeMap[type] || null;
      if (Array.isArray(keyProps) && keyProps[0].type) {
        type = keyProps[0].type;
        required = keyProps[0].require;
        gqlType = `[${mongoToGqlTypeMap[type] || null}!]`;
      }
      return `${key}: ${gqlType}${required ? '!' : ''}`;
    });
  return [name, schemaProps];
}

const getOneQuery = (schemaName) => `${schemaName}(id: ID!): ${schemaName}!`;
const getManyQuery = (schemaName) => `${schemaName}s: [${schemaName}!]`;

const createMutation = (schemaName, props) => `
  create${schemaName}(
    ${props}
  ): ${schemaName}!
`;

const updateMutation = (schemaName, props) => `
  update${schemaName}(
    id: ID!
    ${props}
  ): ${schemaName}!
`;

const deleteMutation = (schemaName) => `delete${schemaName}(id: ID!): ${schemaName}!`;

const createSchemaDef = (schemaName, props) => `
  type ${schemaName} {
    id: ID!
    ${props}
  }
`;

function createSchemaFromModelDef(modelDef) {
  const [name, schemaProps] = getSchemaPropsFromModelDef(modelDef);
  const textTransform = schemaProps
    .map((item) => `\u0020\u0020${item}`).join('\n');

  const query = {
    getOneQuery: getOneQuery(name),
    getManyQuery: getManyQuery(name),
  };

  const mutations = {
    createMutation: createMutation(name, textTransform),
    updateMutation: updateMutation(name, textTransform),
    deleteMutation: deleteMutation(name),
  };

  const typeDef = createSchemaDef(name, textTransform);

  const schemaContent = {
    query,
    mutations,
    typeDef,
  };
  return schemaContent;
}

module.exports = {
  getSchemaPropsFromModelDef,
  createSchemaFromModelDef,
};
