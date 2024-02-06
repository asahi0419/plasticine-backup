import cache from '../../../../../presentation/shared/cache/index.js';
import * as CONSTANTS from './constants.js';

class CacheClient {
  constructor(client) {
    this.client = client;
  }

  async set(key, value, px = CONSTANTS.DEFAULT_PX) {
    await this.checkConnection();

    const result = await new Promise((resolve, reject) => {
      this.client.set(key, value, 'PX', px, (err, res) => err ? reject(err) : resolve(res));
    });
    return result === 'OK';
  }

  async get(key) {
    await this.checkConnection();

    const result = await new Promise((resolve, reject) => {
      this.client.get(key, (err, res) => err ? reject(err) : resolve(res));
    });
    return result;
  }

  async del(key) {
    await this.checkConnection();

    const result = await new Promise((resolve, reject) => {
      this.client.del(key, (err, res) => err ? reject(err) : resolve(res));
    });
    return result === 1;
  }

  async exists(key) {
    await this.checkConnection();

    const result = await new Promise((resolve, reject) => {
      this.client.exists(key, (err, res) => err ? reject(err) : resolve(res));
    });
    return result === 1;;
  }

  async checkConnection() {
    const result = await this.client.get('123', (err, res) => {
        if (err) throw new Error(`The Redis service issue: ${err}`);
        return res;
      });
    if (!result) {
      throw new Error(`The Redis service issue`);
    }
    return result;
  }
}

export default () => {
  const client = (process.env.NODE_ENV === 'test')
    ? cache.namespaces.core.client
    : cache.namespaces.custom.client;

  return new CacheClient(client);
}
