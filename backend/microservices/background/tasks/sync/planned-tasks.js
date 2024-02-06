import Promise from 'bluebird';
import { compact, uniq, uniqBy, map, find, filter } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { sandboxFactory } from '../../../../business/sandbox/factory.js';
import PlannedManager from '../../../../business/background/planned/index.js';

export default async () => {
  const user = await db.model('user').where({ name: 'System', surname: 'Planned tasks' }).getOne();
  const sandbox = await sandboxFactory(user);

  const pTasks = await db.model('planned_task').where({ __inserted: true }).orderBy('id', 'desc');
  const sTasks = await db.model('scheduled_task').where({ active: true, __inserted: true }).whereNotIn('id', uniq(compact(map(pTasks, 'scheduled_task')))).andWhere('start_at', '<=', new Date());
  const eRules = await db.model('escalation_rule').where({ active: true, __inserted: true }).whereIn('id', uniq(compact(map(pTasks, 'escalation_rule'))));

  syncS(sandbox, sTasks);
  syncE(sandbox, eRules, pTasks);
};

export const syncS = async (sandbox, sTasks) => {
  await Promise.each(sTasks, async (st) => {
    await new PlannedManager({ ...st, __type: 'scheduled_task' }, sandbox).perform('create');
  });
};

export const syncE = async (sandbox, eRules, pTasks) => {
  await Promise.each(uniqBy(filter(pTasks, 'escalation_rule'), 'escalation_rule'), async (pt) => {
    const rule = find(eRules, { id: pt.escalation_rule });
    if (rule) await new PlannedManager({ ...rule, __type: 'escalation_rule' }, sandbox).perform('reenable', pt);
  });
};
