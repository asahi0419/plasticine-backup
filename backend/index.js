import 'dotenv/config';

import db_create from './scripts/db/create.js';
import db_migrate from './scripts/db/migrate.js';
import db_seed from './scripts/db/seed.js';
import server from './presentation/server/index.js';
import bgMailsProcessor from './microservices/background/mails/processor/index.js';
import bgMailsRetriever from './microservices/background/mails/retriever/index.js';
import bgMailsSender from './microservices/background/mails/sender/index.js';
import bgTasks from './microservices/background/tasks/index.js';
import topology from './microservices/topology/index.js';

const commands = {
  'db:create': db_create,
  'db:migrate': db_migrate,
  'db:seed': db_seed,
  'server:start': server,
  'background-mails:processor:start': bgMailsProcessor,
  'background-mails:retriever:start': bgMailsRetriever,
  'background-mails:sender:start': bgMailsSender,
  'background-tasks:start': bgTasks,
  'topology:start': topology,
};

const [ command, argument ] = process.argv.slice(2);
if (commands[command]) commands[command](argument);