import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Promise from 'bluebird';
import { cloneDeep, keyBy, each, filter } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import cache from '../../presentation/shared/cache/index.js';
import logger from '../../business/logger/index.js';
import finalizer from '../../data-layer/orm/seeds/helpers/finalizer.js';
import ModelImporter from '../../business/import/index.js';
import { sandboxFactory } from '../../business/sandbox/factory.js';

import { createRequire } from 'module';
const Require = createRequire(import.meta.url);

export default async () => {
  process.env.ROOT_ENDPOINT = process.env.ROOT_ENDPOINT || '/api/v1'

  await ensureTable('knex_seeding');
  await cache.start();

  const seedLog = await db.table('knex_seeding');
  const seedLogErrors = filter(seedLog, (r = {}) => r.error);

  if (seedLogErrors.length) {
    console.log('System cant continue until havent fix the following issues and clear db :')
    each(seedLogErrors, ({ name, error }) => {
      console.log(
        '\x1b[31m%s\x1b[0m',
        `[DB - Seed] ${name} failed with error:\n\n${error}`
      );
    });

    process.exit(1);
  }

  const seeds = await new Promise((resolve) => {
    const seedDir = path.resolve(process.cwd(), 'data-layer/orm/seeds');
    const seedLogMap = keyBy(seedLog, 'name');

    fs.readdir(seedDir, async (error, data) => {
      const seedsFiles = data.filter(seed => path.extname(seed) === '.js').sort();
      const seedsToRun = await Promise.reduce(seedsFiles, async (result, name) => {
        const contentPath = path.join(seedDir, name);
        const content = process.env.NODE_ENV === 'production'
          ? Require(contentPath)
          : await import(contentPath);

        const seed = cloneDeep(content.default);
        if (seed.alias === 'scheduled_task') each(seed.records, (r) => delete r.start_at);

        const dPrev = (seedLogMap[name] || {}).digest;
        const dNext = crypto.createHash('md5').update(JSON.stringify(seed)).digest('hex');
        if (dPrev !== dNext) result.push({ name, seed, digest: dNext });

        if (['document_template'].includes(seed.alias)) {
          result.push({ name, seed, digest: dNext });
        }
        return result;
      }, []);

      resolve(seedsToRun);
    });
  });

  if (seeds.length) {
    const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER, {}, 'seeding');

    await Promise.each(seeds, async ({ name, seed, digest }) => {
      try {
        await logSeed({ name, active: true });
        const start = new Date();
        await new ModelImporter(sandbox, 'seeding').process(seed)
        const end = new Date();
        await logSeed({ name, active: false, runned_at: new Date(), digest });

        console.log('\x1b[32m%s\x1b[0m', `[DB - Seed] ${name} (${end - start}ms) ...`);
      } catch (error) {
        await logSeed({ name, active: false, error: error.stack });
        logger.error(error);
        process.exit(1);
      }
    });

    try {
      await finalizer(sandbox);
      process.exit(0);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }

  console.log('\x1b[32m%s\x1b[0m', '[DB - Seed] Already up to date');
  process.exit(0);
}

async function ensureTable(tableName) {
  const table = await db.client.schema.hasTable(tableName);
  if (!table) {
    return db.client.schema.createTable(tableName, (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('digest');
      table.boolean('active').defaultTo(false);
      table.timestamp('runned_at', true).nullable();
      table.text('error');
    });
  }

  const errorColumn = await db.client.schema.hasColumn(tableName, 'error');
  if (!errorColumn) await db.client.schema.table(tableName, (table) => table.text('error'));
}

async function logSeed(attributes = {}) {
  await db.table('knex_seeding').where({ name: attributes.name }).getOne()
    ? await db.table('knex_seeding').where({ name: attributes.name }).update(attributes)
    : await db.table('knex_seeding').insert(attributes)
}
