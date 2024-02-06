import { execSync as shell } from 'child_process';

import * as HELPERS from '../helpers.js';

export default async (name, extension = {}) => {
  if (name === '.installed') {
    shell(`touch ${HELPERS.getFolderPath(extension)}/${name}`);
  }

  if (name === '.active') {
    shell(`touch ${HELPERS.getFolderPath(extension)}/${name}`);
    if (!extension.active) shell(`rm ${HELPERS.getFolderPath(extension)}/${name}`);
  }
};
