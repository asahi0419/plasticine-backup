import db from '../data-layer/orm/index.js';
import * as EXTENSIONS from './index.js';
import { sandboxFactory } from '../business/sandbox/factory.js';

export default async (context = {}) => {
  const sandbox = context.sandbox || await sandboxFactory(process.env.APP_ADMIN_USER);

  await EXTENSIONS.setup({ plugins: EXTENSIONS.config.plugins }, { db, sandbox });
  await EXTENSIONS.init({ plugins: EXTENSIONS.config.plugins }, { db, sandbox });
};
