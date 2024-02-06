import fs from 'fs';
import Promise from 'bluebird';

import * as HELPERS from '../helpers.js';

export default async (command, extension, context) => {
  await prepareContent(extension, context);

  await processMigrations(command, context);
  await processSeeds(command, context);
}

async function prepareContent(extension, context) {
  context.dataLayer = { orm: {
    migrations: { data: [], helpers: {} },
         seeds: { data: [], helpers: {} },
  } };

  await prepareContentOrm(extension, context, 'migrations');
  await prepareContentOrm(extension, context, 'seeds');
}

async function prepareContentOrm(extension, context, type) {
  const path = `${HELPERS.getFolderPath(extension)}`;
  const pathBase = `${path}/data-layer/orm/${type}`;
  const pathFinalizer = `${pathBase}/helpers/finalizer.js`;

  await HELPERS.onPathExists(pathBase, async () => {
    const content = fs.readdirSync(pathBase);
    const reducer = async (result, dir) => {
      return (dir === 'helpers')
        ? result
        : [ ...result, await import(`${pathBase}/${dir}`) ];
    };

    context.dataLayer.orm[type].data = await Promise.reduce(content, reducer, []);
  });

  await HELPERS.onPathExists(pathFinalizer, async () => {
    context.dataLayer.orm[type].helpers.finalizer = (await import(pathFinalizer)).default;
  });
}

async function processMigrations(command, context) {
  const { data = [], helpers = {} } = context.dataLayer.orm.migrations;
  const { finalizer = (() => {}) } = helpers;

  await Promise.each(data, async (migration = {}) => {
    const migrator = (command === 'activate')
      ? migration.up || (() => { })
      : migration.down || (() => { });
    await migrator(context)
  });

  await finalizer(context);
}

async function processSeeds(command, context) {
  if (command !== 'activate') return;

  const ModelImporter = (await import('../../business/import/index.js')).default;
  const { data = [], helpers = {} } = context.dataLayer.orm.seeds;
  const { finalizer = (() => {}) } = helpers;

  await Promise.each(data, (seed = {}) => new ModelImporter(context.sandbox, 'seeding').process(seed.default));
  await finalizer(context);
}
