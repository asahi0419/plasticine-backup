import http from 'http';
import express from 'express';

import router from './router.js';

process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'background-mails:retriever';
process.env.SERVICE_PORT_INTERNAL = process.env.SERVICE_PORT_INTERNAL || 8080;

export default async () => {
  const app = express().use(router);
  http.createServer(app).listen(process.env.SERVICE_PORT_INTERNAL);
  console.log('\x1b[32m%s\x1b[0m', `[service:${process.env.SERVICE_NAME}] Start listening on ${process.env.SERVICE_PORT_INTERNAL}`);
};
