import ORM from './orm/index.js';
import * as Drivers from './drivers/index.js'

export function getClient(trx) {
  const DriverClass = Drivers[process.env.DB_TYPE];
  if (!DriverClass) {
    console.error('Provide DB_TYPE environment variable');
    process.exit(1);
  }

  const driver = new DriverClass();
  if (trx) driver.transacting(trx);

  return driver.getClient();
};

export default new ORM(getClient());
