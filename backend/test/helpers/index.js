import axios from 'axios';
import { each, assign } from 'lodash-es';

import { wrapRecord } from '../../business/sandbox/api/model/index.js';
import Selector from '../../business/record/fetcher/selector.js';
import Record from './record.js';
import cache from '../../presentation/shared/cache/index.js';

const recordManager = (sandbox) => (model, mode) => {
  return new Record(model, sandbox, mode);
}

const recordProxy = (sandbox) => async (attributes, model) => {
  try {
    const modelProxy = new ModelProxy(model, sandbox);
    const recordProxy = await wrapRecord(modelProxy, { preload_data: true })(attributes);

    return recordProxy;
  } catch (error) {
    console.log(error);
  }
};

const _selector = (sandbox, db) => (modelName) => {
  try {
    return new Selector(db.getModel(modelName), sandbox);
  } catch (error) {
    console.log(error);
  }
};

const randomNumber = (length) => {
  return Math.round(Math.random() * length);
}

const email = () => {
  return `test_${randomNumber(10**10)}@test.com`;
}

const alias = (prefix = 'test') => {
  return `${prefix}_${randomNumber(10**10)}`;
}

export const checkSeleniumConnection = async () => {
  try {
    return !!(await axios.request({ url: 'http://selenium:4444' }));
  } catch (e) {
    return false;
  }
}

export const checkBackgroundConnection = async (type) => {
  try {
    return !!(await axios.request({ url: `http://background-${type}-test` }));
  } catch (e) {
    if (e.message.includes('ECONNREFUSED')) return true;
    if (e.message.includes('ENOTFOUND')) return false;
    return false;
  }
}

export const checkPluginsConnection = async (db) => {
  return {
    inventory_models: {
      connected: !!(await db.model('plugin').where({ alias: 'inventory_models' }).getOne()),
    }
  };
}

export const mocker = (module) => {
  const assigned = {};

  return {
    assign: (attributes) => {
      each(attributes, (a, key) => (assigned[key] = module[key]));
      assign(module, attributes);
    },
    clear: (attributes) => {
      assign(module, attributes || assigned);
    },
  };
};

export default (sandbox, db) => ({
  record: {
    manager: recordManager(sandbox),
    proxy: recordProxy(sandbox),
  },
  selector: _selector(sandbox, db),
  mocker,
  email,
  alias,
  randomNumber,
  cache,
});
