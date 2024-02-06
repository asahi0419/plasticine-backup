import moment from 'moment';
import { isDate } from 'lodash-es';

import {
  calculateRuleScheduleTime,
  calculateTaskScheduleTime,
  calculateRuleReEnableTime,
} from '../calculate.js';

const { manager } = h.record;
const date = new Date();

beforeAll(async () => {
  t.model = await manager('model').create();
  t.field = await manager('field').create({ model: t.model.id, type: 'string' });

  t.createRule = (attributes = {}) => manager('escalation_rule').create({
    model: t.model.id,
    target_field: t.field.id,
    ...attributes,
  });

  t.createTask = (attributes = {}) => manager('scheduled_task').create({
    ...attributes,
  });
});

describe('Business', () => {
  describe('Background', () => {
    describe('Planned Manager', () => {
      describe('Performers Helpers - Calculate', () => {
        describe('calculateRuleScheduleTime(rule, sandbox)', () => {
          it('Should calculate rule schedule time', async () => {
            let record, rule, result;

            record = await manager(t.model.alias).create();
            rule = await t.createRule();
            result = await calculateRuleScheduleTime(record, rule);

            expect(result).not.toBeDefined();

            record = await manager(t.model.alias).create({ [t.field.alias]: date });
            rule = await t.createRule();
            result = await calculateRuleScheduleTime(record, rule);

            expect(result).toEqual(date);

            record = await manager(t.model.alias).create({ [t.field.alias]: date });
            rule = await t.createRule({ offset: '15m' });
            result = await calculateRuleScheduleTime(record, rule);

            expect(+moment(result)).toEqual(+moment(date).add(15, 'minutes'));
          });
        });
        describe('calculateTaskScheduleTime(task)', () => {
          it('Should calculate task schedule time', async () => {
            let task = { reenable_type: 'no_reenable' };
            let result = calculateTaskScheduleTime(task);
            let expected = undefined;

            expect(result).toEqual(expected);

            task = { reenable_every: null };
            result = calculateTaskScheduleTime(task);
            expected = undefined;

            expect(result).toEqual(expected);

            task = { reenable_every: null };
            result = calculateTaskScheduleTime(task);
            expected = undefined;

            expect(result).toEqual(expected);

            task = { last_run_at: null };
            result = calculateTaskScheduleTime(task);
            expected = undefined;

            expect(result).toEqual(expected);

            task = { start_at: new Date('12/26/2019 23:00:00'), reenable_type: 'days', reenable_every: 1 };
            result = calculateTaskScheduleTime(task);
            expected = moment(new Date().setHours(0,0,0,0)).add(23, 'hours');

            expect(+result).toEqual(+expected);
          });
        });
        describe('calculateRuleReEnableTime(rule, task)', () => {
          it('Should calculate rule reenable time', async () => {
            let record, rule, task, result;

            record = await manager(t.model.alias).create();
            rule = await t.createRule();
            task = await t.createTask({ model: t.model.id, record: record.id });
            result = await calculateRuleReEnableTime(rule, task);

            expect(result).not.toBeDefined();

            record = await manager(t.model.alias).create();
            rule = await t.createRule({ re_enable_after: t.field.alias });
            task = await t.createTask({ model: t.model.id, record: record.id });
            result = await calculateRuleReEnableTime(rule, task);

            expect(isDate(result)).toEqual(true);
          });
        });
      });
    });
  });
});
