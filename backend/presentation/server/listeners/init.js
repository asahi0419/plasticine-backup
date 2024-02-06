import db from '../../../data-layer/orm/index.js';
import { useProductionLogs } from '../../../business/logger/index.js';

export default async () => {
  await initDBListeners();
}

async function initDBListeners() {
  const times = {};

  db.client
    .on('query', (query) => {
      if (useProductionLogs()) {
        times[query.__knexQueryUid] = new Date();
      }
    })
    .on('query-response', (_, query, builder) => {
      if (useProductionLogs()) {
        const uid = query.__knexQueryUid;
        const elapsedTime = (new Date() - times[uid]).toFixed(3);
        console.log(`[${elapsedTime} ms] ${builder.toString()}`);
        delete times[uid];
      }
    });
}
