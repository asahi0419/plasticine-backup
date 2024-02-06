import 'dotenv/config';
import jest from 'jest';

process.env.DB_TYPE = process.env.DB_TYPE || 'postgres';

import CONFIG from './config.js';

async function start() {
  const { success } = await jest.runCLI(CONFIG, CONFIG.projects);

  return success ? process.exit(1) : process.exit(0);
}

start();
