import db from '../../../../../data-layer/orm/index.js';
import Selector from '../../../../../business/record/fetcher/selector.js';
import ModelProxy from '../../../../../business/sandbox/api/model/index.js';
import QueryBuilder from '../../../../../business/sandbox/api/query/builder.js';
import logger from '../../../../../business/logger/index.js';
import { getSetting } from '../../../../../business/setting/index.js';

const DEFAULT_SCOPE = { main: [] };

export default async (req, res) => {
  const { sandbox, params, query } = req;
  const { chartId } = params;
  const { filter, hidden_filter } = query;

  try {
    const chart = await db.model('chart').where({ id: chartId }).getOne();
    const model = db.getModel(chart.data_source);

    const selectorScope = new Selector(model, sandbox).getScope(filter, hidden_filter);
    const modelProxy = new ModelProxy(model, sandbox);
    const queryBuilder = new QueryBuilder(modelProxy, selectorScope);

    sandbox.addInternalVariable('queryBuilder', queryBuilder);

    const script = await wrapScript(chart.server_script);
    const result = sandbox.executeScript(script, `chart/${chart.id}/server_script`);

    const scope = await (result && (typeof (result.then) === 'function')
      ? result.catch((error) => logger.error(error) && Promise.resolve())
      : result);

    res.json({ data: { scope: scope || DEFAULT_SCOPE } });
  } catch (error) {
    logger.error(error)
    res.json({ data: { scope: DEFAULT_SCOPE, error } });
  }
};

function wrapScript(script) {
  if (script) {
    const wrapper = `const chartScript = ${script};\nreturn chartScript(p.internalVariables.queryBuilder);`;
    return Promise.resolve(wrapper);
  }

  const limits = getSetting('limits');
  return `return {
  main: await p.iterMap(p.internalVariables.queryBuilder.limit(${limits.chart}), record => record.attributes),
};`;
}
