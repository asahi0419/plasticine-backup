import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import path from 'path';

const link = str => path.join(__dirname, str);

const config = {
  rootDir: link('..'),
  projects: [link('..')],
  verbose: true,
  modulePathIgnorePatterns: ['node_modules'],
  _: process.argv.slice(2),
};

if (process.env.DB_SETUP) {
  config.testMatch = ['<rootDir>/**/**.spec.js'];
  config.testEnvironment = link('environment');
  config.setupTestFrameworkScriptFile = link('framework');
  config.runInBand = true;
} else {
  config.testMatch = ['<rootDir>/**/**.test.js'];
}

export default config;
