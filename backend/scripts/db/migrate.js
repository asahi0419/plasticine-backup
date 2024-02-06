/* eslint no-console: ["error", { allow: ["log", "error"] }] */

import db from '../../data-layer/orm/index.js';
import cache from '../../presentation/shared/cache/index.js';
import cleaner from '../../data-layer/orm/migrations/helpers/cleaner.js';
import migrators from '../../extensions/migrators/index.js';
import createStorage from '../../business/storage/factory.js';
import { sandboxFactory } from '../../business/sandbox/factory.js';

process.env.ROOT_ENDPOINT = process.env.ROOT_ENDPOINT || '/api/v1'

async function getModelImporter() {
  const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);
  return new ModelImporter(sandbox, 'seeding');
}

function getSandbox(userEmail) {
  return sandboxFactory(userEmail);
}

async function hasMigrations() {
  try {
    await db.client('knex_migrations');
    await db.client('object_1');
    return true;
  } catch (e) {
    return false;
  }
}

export default async () => {
  const migrations = await hasMigrations();

  try {
    if (migrations) {
      await cache.start();
    }

    await migrators.setup({
      db,
      getModelImporter,
      getSandbox,
      storage: await createStorage(),
      options: { attachments_path: process.env.ATTACHMENTS_PATH },
    });

    await cleaner();
    await db.client.migrate.forceFreeMigrationsLock();
    const [batchNo, log] = await db.client.migrate.latest();

    if (!migrations) {
      await cache.start();
    }

    if (log.length === 0) {
      console.log('\x1b[32m%s\x1b[0m', '[DB - Migrate] Already up to date');
    } else {
      console.log('\x1b[32m%s\x1b[0m', `[DB - Migrate] Batch ${batchNo} run: ${log.length} migrations \n${log.join('\n')}`);
    }

    process.exit(0);
  } catch(error) {
    console.error(error);
    process.exit(1);
  }
}
