# Chainstarters Interview

> Build a full-stack app with a Bun + GraphQL backend and a React 19 frontend, where users can submit data via a mutation and all connected clients receive real-time updates through GraphQL subscriptions using a PubSub pattern.

## Installation

```
$ git clone git@github.com:rhnaxifg4y/chainstarters-interview.git
$ cd chainstarters-interview
$ cd backend && bun install && cd -
$ cd frontend && bun install && cd -
```

## Usage

In one terminal, start the backend:

```
$ cd backend
$ bun index.ts
Server is running on http://localhost:4000/graphql
WebSocket subscriptions available at ws://localhost:4000/graphql
```

In another terminal, start the frontend:

```
$ cd frontend
$ npm run dev

> bun-react-template@0.1.0 dev
> bun --hot src/index.tsx

🚀 Server running at http://localhost:3000/
```

Open the frontend app in two tabs and try it out!

## Demo

[Screencast from 2025-04-06 15-09-24.webm](https://github.com/user-attachments/assets/ce694f28-cfe1-41d2-98a6-b1c08b3614a9)
