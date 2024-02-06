import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressWinston from 'express-winston';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import promBundle from 'express-prom-bundle';

import router from './router/index.js';
import passport from './passport/index.js';
import i18nBackend from '../../business/i18n/backend.js';
import { errorHandler } from '../../business/error/express.js';
import { sandboxFactory } from '../../business/sandbox/factory.js';
import { loggerTransports } from '../../business/logger/index.js';
import { initStorageBuckets } from '../../microservices/storage/helpers.js';

export default async () => {
  const app = express();

  const metricsMiddleware = promBundle({ includeMethod: true });
  app.use(metricsMiddleware);

  await initStorageBuckets([process.env.STORAGE_BUCKET || 'plasticine']);
  i18next.use(i18nBackend).init({ preload: ['en'], fallbackLng: 'en' });
  app.use(i18nextMiddleware.handle(i18next));

  app.i18next = i18next;
  app.sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);

  app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(expressWinston.logger({ transports: loggerTransports }));
  app.use(cookieParser());
  app.use(passport.initialize(passport.prepare()));
  app.use(cors());

  await router(app);
  app.use(errorHandler);

  return app;
};
