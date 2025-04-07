import { createServer } from 'http';
import { createYoga, createSchema, createPubSub } from 'graphql-yoga';
import { useServer } from 'graphql-ws/use/ws';
import { WebSocketServer } from 'ws';

const pubSub = createPubSub();

const typeDefs = `
  type Message {
    id: ID!
    content: String!
    author: String!
    createdAt: String!
  }
  type Query {
    messages: [Message!]!
  }
  type Mutation {
    postMessage(content: String!, author: String!): Message!
  }
  type Subscription {
    messagePosted: Message!
  }
`;

const messages = [];

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (_, { content, author }) => {
      const message = {
        id: String(messages.length + 1),
        content,
        author,
        createdAt: new Date().toISOString(),
      };
      messages.push(message);
      console.log('Publishing message:', message); // Debug log
      pubSub.publish('MESSAGE_POSTED', { messagePosted: message });
      return message;
    },
  },
  Subscription: {
    messagePosted: {
      subscribe: () => {
        console.log('Client subscribed to MESSAGE_POSTED');
        return pubSub.subscribe('MESSAGE_POSTED');
      },
    },
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphiql: {
    subscriptionsProtocol: 'WS',
  },
});

const server = createServer(yoga);

const wsServer = new WebSocketServer({
  server,
  path: '/graphql',
});

useServer(
  {
    schema,
    onConnect: () => {
      console.log('WebSocket client connected');
    },
    onDisconnect: () => {
      console.log('WebSocket client disconnected');
    },
  },
  wsServer
);

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000/graphql');
  console.log('WebSocket subscriptions available at ws://localhost:4000/graphql');
});