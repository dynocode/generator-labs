const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');

const schema = require('./schema');
const resolvers = require('./resolvers');
const { models, connectDb } = require('./models');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('OK');
});

const typeDefs = Object.values(schema);

const PORT = process.env.PORT || 8000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // eslint-disable-next-line no-unused-vars, arrow-body-style
  context: async (context) => {
    // TODO: auth, loaders here.
    return {
      models,
    };
  },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

connectDb(process.env.MONGO_URI).then(async () => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
  });
});
