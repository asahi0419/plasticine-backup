import moment from 'moment';

const { manager } = h.record;

describe('DB Rule: Scheduled Task', () => {
  describe('Before Delete', () => {
    it('Should delete all related planned tasks', async () => {
      let record = await manager('scheduled_task').create({ start_at: moment().add(1, 'minutes') });
      let result = await db.model('planned_task').where({ scheduled_task: record.id });

      expect(result).toHaveLength(1);

      await manager('scheduled_task').destroy(record);
      result = await db.model('planned_task').where({ scheduled_task: record.id });

      expect(result).toHaveLength(0);
    });
  });
  describe('After Insert', () => {
    it('Should create related planned task', async () => {
      const record = await manager('scheduled_task').create({ start_at: moment().add(1, 'minutes') });
      const result = await db.model('planned_task').where({ scheduled_task: record.id });

      expect(result).toHaveLength(1);
    });
    it('Should not create related planned task if not active', async () => {
      const record = await manager('scheduled_task').create({ active: false });
      const result = await db.model('planned_task').where({ scheduled_task: record.id });

      expect(result).toHaveLength(0);
    });
  });
  describe('After Update', () => {
    it('Should recalculate scheduling time for related planned tasks with status "new"', async () => {
      const reenable_every = 1;
      const reenable_type = 'minutes';

      let sTime = new Date();
      let pTime = moment(sTime).add(reenable_every, reenable_type);

      let sTask = await manager('scheduled_task').create({ start_at: moment().add(1, 'minutes'), scheduled_on: sTime,  });
      let pTask = await db.model('planned_task').where({ scheduled_task: sTask.id, status: 'new' }).getOne();

      expect(new Date(pTime)).not.toEqual(new Date(pTask.scheduled_on));

      sTask = await manager('scheduled_task').update(sTask, { start_at: sTime, reenable_type, reenable_every });
      pTask = await db.model('planned_task').where({ scheduled_task: sTask.id, status: 'new' }).getOne();

      expect(new Date(pTime)).toEqual(new Date(pTask.scheduled_on));
    });
    it('Should delete already created related planned tasks if not active', async () => {
      const record = await manager('scheduled_task').create({ start_at: moment().add(1, 'minutes') });

      let result = await db.model('planned_task').where({ scheduled_task: record.id });
      expect(result).toHaveLength(1);

      await manager('scheduled_task').update(record, { active: false });

      result = await db.model('planned_task').where({ scheduled_task: record.id });
      expect(result).toHaveLength(0);
    });
    it('Should not delete already created related planned tasks if active', async () => {
      const record = await manager('scheduled_task').create({ start_at: moment().add(1, 'minutes') });

      let result = await db.model('planned_task').where({ scheduled_task: record.id });
      expect(result).toHaveLength(1);

      await manager('scheduled_task').update(record, { updated_by: sandbox.user.id });

      result = await db.model('planned_task').where({ scheduled_task: record.id });
      expect(result).toHaveLength(1);
    });
    it('Should create planned task if active changed to true', async () => {
      const record = await manager('scheduled_task').create({ active: false });

      let result = await db.model('planned_task').where({ scheduled_task: record.id });
      expect(result).toHaveLength(0);

      await manager('scheduled_task').update(record, { start_at: moment().add(1, 'minutes'), active: true });

      result = await db.model('planned_task').where({ scheduled_task: record.id });
      expect(result).toHaveLength(1);
    });
  });
});
