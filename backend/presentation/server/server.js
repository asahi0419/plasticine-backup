import http from 'http';

import createApp from './app.js';
import createWebSocketServer from './wss.js';

export default async () => {
  const app = await createApp();

  const server = http.createServer(app);
  createWebSocketServer(server);

  server.i18next = app.i18next;
  server.sandbox = app.sandbox;

  return server;
};
