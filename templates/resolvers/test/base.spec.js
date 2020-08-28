/**
 * Make this in to a template
 * Add base tests
 */
import { expect } from 'chai';
import sinon from 'sinon';

import resolver from '../example';

const ctx = () => ({
  models: {
    Example: {
      findOne: sinon.spy(),
      find: sinon.spy(),
      create: sinon.spy(),
      findOneAndUpdate: sinon.spy(),
    },
  },
});

describe('Resolver .Example', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('Query: Example', () => {
    it('should resolve query', async () => {
      const spy = ctx();
      const input = { id: 'someId' };

      await resolver.Query.Example({}, input, spy);

      const findOneCall = spy.models.Example.findOne.calledOnce;
      const args = spy.models.Example.findOne.args[0][0];
      const expectedArgs = { _id: input.id };

      expect(findOneCall).to.equal(true);
      expect(args).to.deep.equal(expectedArgs);
    });
  });
  describe('Query: Examples', () => {
    it('should resolve query', async () => {
      const spy = ctx();
      const input = {};

      await resolver.Query.Examples({}, input, spy);

      const findCall = spy.models.Example.find.calledOnce;
      const args = spy.models.Example.find.args[0][0];

      expect(findCall).to.equal(true);
      expect(!!args).to.equal(false);
    });
  });

  describe('Mutation: createExample', () => {
    it('should create new document', async () => {
      const spy = ctx();
      const input = { name: 'Hei', value: true };
      // TODO: need to get the schema to know inputs
      await resolver.Mutation.createExample({}, input, spy);

      const findCall = spy.models.Example.create.calledOnce;
      const args = spy.models.Example.create.args[0][0];

      expect(findCall).to.equal(true);
      expect(args).to.deep.equal(input);
    });
  });
  describe('Mutation: updateExample', () => {
    it('should update existing document', async () => {
      const spy = ctx();
      const input = { id: 'someId', value: false };
      // TODO: need to get the schema to know inputs
      await resolver.Mutation.updateExample({}, input, spy);

      const findCall = spy.models.Example.findOneAndUpdate.calledOnce;
      // No need to test the options now, might change in the future.
      // I keep them here, so it is easy to see how to test it in the future;
      // eslint-disable-next-line no-unused-vars
      const [query, updateData, options] = spy.models.Example.findOneAndUpdate.args[0];

      const { id, ...expectedUpdateData } = input;

      expect(findCall).to.equal(true);
      expect(query._id).to.equal(id);
      expect(updateData).to.deep.equal(expectedUpdateData);
    });
  });
  describe('Mutation: deleteExample', () => {
    it('should delete document', async () => {
      const spy = ctx();
      const input = { id: 'someId' };
      await resolver.Mutation.deleteExample({}, input, spy);

      const findCall = spy.models.Example.findOneAndUpdate.calledOnce;
      // No need to test the options now, might change in the future.
      // I keep them here, so it is easy to see how to test it in the future;
      // eslint-disable-next-line no-unused-vars
      const [query, updateData, options] = spy.models.Example.findOneAndUpdate.args[0];

      const expectedQuery = { _id: input.id };
      const expectedUpdateData = { isArchived: true };

      expect(findCall).to.equal(true);
      expect(query).to.deep.equal(expectedQuery);
      expect(updateData).to.deep.equal(expectedUpdateData);
    });
  });
});
