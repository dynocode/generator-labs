module.exports = {
  Query: {
    Example: async (parent, input, ctx) => ctx.models.Example.findOne({ _id: input.id }),
    Examples: async (parent, input, ctx) => ctx.models.Example.find(),
  },
  Mutation: {
    createExample: async (parent, input, ctx) => ctx.models.Example.create(input),
  },
};
