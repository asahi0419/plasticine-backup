import db from '../../data-layer/orm/index.js';

export default create;

async function create(params = {}) {
  const { reconnect = 5000 } = params;

  try {
    const exists = await db.client.createDatabase(process.env.DB_NAME);
    const message = exists ? 'already exists' : 'created';

    console.log('\x1b[32m%s\x1b[0m', `[DB - Create] "${process.env.DB_NAME}" ${message}`);
    process.exit(0);
  } catch (error) {
    console.log('\x1b[32m%s\x1b[0m', `[DB - Create] no connection, trying to reconnect in ${reconnect / 1000}s`);
    await new Promise((resolve) => setTimeout(() => {
      resolve(create());
    }, reconnect));
  }
}
