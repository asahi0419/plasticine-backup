import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { execSync as shell } from 'child_process';

import { onPathExists } from '../helpers.js';

export function setMigrated(alias) {
  shell(`touch ${__dirname}/list/${alias}/.migrated`);
}

export async function checkMigrated(alias) {
  let migrated;
  await onPathExists(`${__dirname}/list/${alias}/.migrated`, () => (migrated = true));
  return migrated;
}

export async function checkActive(alias) {
  let active;
  await onPathExists(`${__dirname}/list/${alias}/.active`, () => (active = true));
  return active;
}
