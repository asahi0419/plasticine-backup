const { manager } = h.record;

const delay = ms => new Promise(r => setTimeout(r, ms));

beforeAll(async () => {
  t.model = await manager('model').create();
  t.fields = {
    string: await manager('field').create({ model: t.model.id, type: 'string' }),
    user: await manager('field').create({ model: t.model.id, type: 'reference', options: JSON.stringify({ foreign_model: 'user' }) }),
    datetime: await manager('field').create({ model: t.model.id, type: 'datetime' }),
  };
});

describe('Planned task', () => {
  if (!background_tasks.connected) return it('Background tasks is disconnected', () => expect(background_tasks.connected).toEqual(false));

  it('Should be correctly processed', async () => {
    const rule = await manager('escalation_rule').create({ model: t.model.id, target_field: t.fields.datetime });
    await db.model(t.model.alias, sandbox).createRecord({ [t.fields.datetime.alias]: new Date() }, false);
    await delay(15000);
    const task = await db.model('planned_task').getOne();

    expect(task.status).toEqual('completed');
    expect(task.created_by).toEqual(3);

    await db.model('planned_task').delete();
    await db.model('escalation_rule').delete();
  });

  it('Should be correctly processed with rule run by user', async () => {
    const rule = await manager('escalation_rule').create({ model: t.model.id, target_field: t.fields.datetime, run_by_user: t.fields.user.id });
    const record = await db.model(t.model.alias, sandbox).createRecord({ [t.fields.datetime.alias]: new Date(), [t.fields.user.alias]: 1 }, false);
    await delay(15000);
    const task = await db.model('planned_task').getOne();

    expect(task.status).toEqual('completed');
    expect(task.created_by).toEqual(1);

    await db.model('planned_task').delete();
    await db.model('escalation_rule').delete();
  });

  it('Should be correctly processed with rule run by user', async () => {
    const rule = await manager('escalation_rule').create({ model: t.model.id, target_field: t.fields.datetime, run_by_user: t.fields.user.id });
    const record = await db.model(t.model.alias, sandbox).createRecord({ [t.fields.datetime.alias]: new Date() }, false);
    await delay(15000);
    const task = await db.model('planned_task').getOne();

    expect(task.status).toEqual('completed');
    expect(task.created_by).toEqual(3);

    await db.model('planned_task').delete();
    await db.model('escalation_rule').delete();
  });

  it('Should be correctly processed with rule run by user [deleted user]', async () => {
    const rule = await manager('escalation_rule').create({ model: t.model.id, target_field: t.fields.datetime, run_by_user: t.fields.user.id, script: `await p.record.update({ ['${t.fields.string.alias}']: p.currentUser.getValue('id') })` });
    const user = await manager('user').create();

    const datetime = new Date();
    datetime.setSeconds(datetime.getSeconds() + 5);

    const record = await db.model(t.model.alias, sandbox).createRecord({ [t.fields.datetime.alias]: datetime, [t.fields.user.alias]: user.id }, false);
    await manager('user').destroy({ id: user.id });

    await delay(20000);
    const task = await db.model('planned_task').getOne();

    expect(task.status).toEqual('completed');
    expect(task.created_by).toEqual(user.id);

    expect(await db.model(t.model.alias).where({ id: record.id }).pluck(t.fields.string.alias).getOne()).toEqual('3')

    await db.model('planned_task').delete();
    await db.model('escalation_rule').delete();
  });
});
