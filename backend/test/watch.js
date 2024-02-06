import 'dotenv/config';
import jest from 'jest';

import CONFIG from './config.js';

CONFIG.watchAll = true;

async function start() {
  const { success } = await jest.runCLI(CONFIG, CONFIG.projects);

  return success ? process.exit(1) : process.exit(0);
}

start();
