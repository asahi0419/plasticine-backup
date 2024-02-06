import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';

import i18nBackend from '../../business/i18n/backend.js';
import Middlewares from '../../presentation/server/middlewares/index.js';
import router from './router.js';

process.env.SERVICE_NAME = process.env.SERVICE_NAME || 'topology';
process.env.SERVICE_PORT_INTERNAL = process.env.SERVICE_PORT_INTERNAL || 8080;

export default async () => {
  const app = express();

  i18next.use(i18nBackend).init({ preload: ['en'], fallbackLng: 'en' });
  app.use(i18nextMiddleware.handle(i18next));
  app.i18next = i18next;

  app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(Middlewares.extendSelf);
  app.use(router);

  http.createServer(app).listen(process.env.SERVICE_PORT_INTERNAL);
  console.log('\x1b[32m%s\x1b[0m', `[service:${process.env.SERVICE_NAME}] Start listening on ${process.env.SERVICE_PORT_INTERNAL}`);
};
