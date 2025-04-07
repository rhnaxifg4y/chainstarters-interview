import React, { useRef, useState, type FormEvent } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useMutation,
  useSubscription,
  gql,
} from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { split } from '@apollo/client/link/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const POST_MESSAGE = gql`
  mutation PostMessage($content: String!, $author: String!) {
    postMessage(content: $content, author: $author) {
      id
      content
      author
      createdAt
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessagePosted {
    messagePosted {
      id
      content
      author
      createdAt
    }
  }
`;

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

function Chatbox() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [author] = useState('Anonymous');
  const [messages, setMessages] = useState([]);

  const [postMessage] = useMutation(POST_MESSAGE, {
    onCompleted: (data) => {
      console.log('Mutation completed:', data);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      responseInputRef.current!.value = `Error posting message: ${error.message}`;
    },
  });

  const { data, error, loading } = useSubscription(MESSAGE_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('Subscription data received:', data);
      const newMessage = data.data.messagePosted;
      setMessages((prev) => {
        const newMessages = [...prev, newMessage];
        responseInputRef.current!.value = newMessages
          .map((msg) => `${msg.author} (${new Date(msg.createdAt).toLocaleTimeString()}): ${msg.content}`)
          .join('\n');
        return newMessages;
      });
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      responseInputRef.current!.value = `Subscription Error: ${error.message}`;
    },
    onComplete: () => {
      console.log('Subscription completed');
    },
  });

  console.log('Subscription state:', { data, error, loading });

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = formData.get("message") as string;

    const content = message.trim();
    if (message) {
      postMessage({ variables: { content, author } });
      form.reset();
    }
  };

  return (
    <div className="api-tester">
      <form onSubmit={testEndpoint} className="endpoint-row">
        <input
          type="text"
          name="message"
          defaultValue=""
          className="url-input"
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
      <textarea
        ref={responseInputRef}
        readOnly
        placeholder="Messages will appear here..."
        className="response-area"
        style={{ minHeight: '200px' }}
      />
    </div>
  );
}

export function APITester() {
  return (
    <ApolloProvider client={client}>
      <Chatbox />
    </ApolloProvider>
  );
}