import IntegrityManager from '../index.js';

const { manager } = h.record;

beforeAll(async () => {
  t.scheduled_task = await manager('scheduled_task').create();
  await new IntegrityManager(t.scheduled_task, sandbox).perform('delete');
});

const checkRelatedPresence = async (model, attributes) => {
  const records = await db.model(model).where(attributes);
  expect(records).toHaveLength(0);
};

describe('IntegrityManager: Scheduled task', () => {
  describe('.perform(\'delete\')', () => {
    it('It should delete all related models', () => checkRelatedPresence('planned_task', { scheduled_task: t.scheduled_task.id }));
  });
});
