import { keyBy, find, filter, map } from 'lodash-es';

import seed from '../40-scheduled-tasks.js';

const model = db.getModel('scheduled_task');
const { fields, layouts, forms, views, actions, records } = seed;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.views = keyBy(await db.model('view').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.forms = keyBy(await db.model('form').where({ model: model.id }), 'alias');
  t.actions = keyBy(await db.model('action').where({ model: model.id }), 'alias');
  t.records = keyBy(await db.model('scheduled_task'), 'name');
  t.coreLocks = await db.model('core_lock').where({ model: model.id });
});

describe('Model: Scheduled task', () => {
  describe('Fields', () => {
    describe('Name', () => {
      it('Should have name', () => expect(t.fields['name'].name).toEqual(find(fields, { alias: 'name' }).name));
      it('Should have type', () => expect(t.fields['name'].type).toEqual(find(fields, { alias: 'name' }).type));
      it('Should have index', () => expect(t.fields['name'].index).toEqual(find(fields, { alias: 'name' }).index));
      it('Should have options', () => expect(t.fields['name'].options).toEqual(JSON.stringify(find(fields, { alias: 'name' }).options || {})));
    });

    describe('Description', () => {
      it('Should have name', () => expect(t.fields['description'].name).toEqual(find(fields, { alias: 'description' }).name));
      it('Should have type', () => expect(t.fields['description'].type).toEqual(find(fields, { alias: 'description' }).type));
      it('Should have options', () => expect(t.fields['description'].options).toEqual(JSON.stringify(find(fields, { alias: 'description' }).options || {})));
    });

    describe('Active', () => {
      it('Should have name', () => expect(t.fields['active'].name).toEqual(find(fields, { alias: 'active' }).name));
      it('Should have type', () => expect(t.fields['active'].type).toEqual(find(fields, { alias: 'active' }).type));
      it('Should have options', () => expect(t.fields['active'].options).toEqual(JSON.stringify(find(fields, { alias: 'active' }).options || {})));
    });

    describe('Start at', () => {
      it('Should have name', () => expect(t.fields['start_at'].name).toEqual(find(fields, { alias: 'start_at' }).name));
      it('Should have type', () => expect(t.fields['start_at'].type).toEqual(find(fields, { alias: 'start_at' }).type));
      it('Should have options', () => expect(t.fields['start_at'].options).toEqual(JSON.stringify(find(fields, { alias: 'start_at' }).options || {})));
      it('Should be required', () => expect(t.fields['start_at'].required_when_script).toEqual(find(fields, { alias: 'start_at' }).required_when_script));
    });

    describe('Reenable type', () => {
      it('Should have name', () => expect(t.fields['reenable_type'].name).toEqual(find(fields, { alias: 'reenable_type' }).name));
      it('Should have type', () => expect(t.fields['reenable_type'].type).toEqual(find(fields, { alias: 'reenable_type' }).type));
      it('Should have options', () => expect(t.fields['reenable_type'].options).toEqual(JSON.stringify(find(fields, { alias: 'reenable_type' }).options || {})));
    });

    describe('Reenable every', () => {
      it('Should have name', () => expect(t.fields['reenable_every'].name).toEqual(find(fields, { alias: 'reenable_every' }).name));
      it('Should have type', () => expect(t.fields['reenable_every'].type).toEqual(find(fields, { alias: 'reenable_every' }).type));
      it('Should be required', () => expect(t.fields['reenable_every'].required_when_script).toEqual(find(fields, { alias: 'reenable_every' }).required_when_script));
    });

    describe('Reenable end', () => {
      it('Should have name', () => expect(t.fields['reenable_end'].name).toEqual(find(fields, { alias: 'reenable_end' }).name));
      it('Should have type', () => expect(t.fields['reenable_end'].type).toEqual(find(fields, { alias: 'reenable_end' }).type));
      it('Should have options', () => expect(t.fields['reenable_end'].options).toEqual(JSON.stringify(find(fields, { alias: 'reenable_end' }).options || {})));
    });

    describe('End by count', () => {
      it('Should have name', () => expect(t.fields['end_by_count'].name).toEqual(find(fields, { alias: 'end_by_count' }).name));
      it('Should have type', () => expect(t.fields['end_by_count'].type).toEqual(find(fields, { alias: 'end_by_count' }).type));
      it('Should be hidden', () => expect(t.fields['end_by_count'].hidden_when_script).toEqual(find(fields, { alias: 'end_by_count' }).hidden_when_script));
      it('Should be required', () => expect(t.fields['end_by_count'].required_when_script).toEqual(find(fields, { alias: 'end_by_count' }).required_when_script));
    });

    describe('End by date', () => {
      it('Should have name', () => expect(t.fields['end_by_date'].name).toEqual(find(fields, { alias: 'end_by_date' }).name));
      it('Should have type', () => expect(t.fields['end_by_date'].type).toEqual(find(fields, { alias: 'end_by_date' }).type));
      it('Should be hidden', () => expect(t.fields['end_by_date'].hidden_when_script).toEqual(find(fields, { alias: 'end_by_date' }).hidden_when_script));
      it('Should be required', () => expect(t.fields['end_by_date'].required_when_script).toEqual(find(fields, { alias: 'end_by_date' }).required_when_script));
    });

    describe('Script', () => {
      it('Should have name', () => expect(t.fields['script'].name).toEqual(find(fields, { alias: 'script' }).name));
      it('Should have type', () => expect(t.fields['script'].type).toEqual(find(fields, { alias: 'script' }).type));
      it('Should have options', () => expect(t.fields['script'].options).toEqual(JSON.stringify(find(fields, { alias: 'script' }).options || {})));
      it('Should be required', () => expect(t.fields['script'].required_when_script).toEqual(find(fields, { alias: 'script' }).required_when_script));
    });

    describe('Last run at', () => {
      it('Should have name', () => expect(t.fields['last_run_at'].name).toEqual(find(fields, { alias: 'last_run_at' }).name));
      it('Should have type', () => expect(t.fields['last_run_at'].type).toEqual(find(fields, { alias: 'last_run_at' }).type));
    });

    describe('Last run duration', () => {
      it('Should have name', () => expect(t.fields['last_run_duration'].name).toEqual(find(fields, { alias: 'last_run_duration' }).name));
      it('Should have type', () => expect(t.fields['last_run_duration'].type).toEqual(find(fields, { alias: 'last_run_duration' }).type));
    });

    describe('Run counter', () => {
      it('Should have name', () => expect(t.fields['run_counter'].name).toEqual(find(fields, { alias: 'run_counter' }).name));
      it('Should have type', () => expect(t.fields['run_counter'].type).toEqual(find(fields, { alias: 'run_counter' }).type));
      it('Should have options', () => expect(t.fields['run_counter'].options).toEqual(JSON.stringify(find(fields, { alias: 'run_counter' }).options || {})));
    });
  });

  describe('Views', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.views['default'].name).toEqual(find(views, { alias: 'default' }).name));
      it('Should have type', () => expect(t.views['default'].type).toEqual(find(views, { alias: 'default' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'default' }).layout));
      it('Should have condition script', () => expect(t.views['default'].condition_script).toEqual(find(views, { alias: 'default' }).condition_script));
    });
  });

  describe('Layouts', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.layouts['Default'].name).toEqual(find(layouts, { name: 'Default' }).name));
      it('Should have type', () => expect(t.layouts['Default'].type).toEqual(find(layouts, { name: 'Default' }).type));
      it('Should have options', () => expect(t.layouts['Default'].options).toEqual(JSON.stringify(find(layouts, { name: 'Default' }).options)));
    });
  });

  describe('Forms', () => {
    describe('Default', () => {
      it('Should have options', () => expect(t.forms['default'].options).toEqual(JSON.stringify(find(forms, { alias: 'default' }).options)));
    });
  });

  describe('Actions', () => {
    describe('Run now', () => {
      it('Should have server_script', () => expect(t.actions['run_now'].server_script).toEqual(find(actions, { alias: 'run_now' }).server_script));
      it('Should have condition_script', () => expect(t.actions['run_now'].condition_script).toEqual(find(actions, { alias: 'run_now' }).condition_script));
      it('Should have type', () => expect(t.actions['run_now'].type).toEqual(find(actions, { alias: 'run_now' }).type));
      it('Should have on_insert', () => expect(t.actions['run_now'].on_insert).toEqual(find(actions, { alias: 'run_now' }).on_insert));
      it('Should have on_update', () => expect(t.actions['run_now'].on_update).toEqual(find(actions, { alias: 'run_now' }).on_update));
    });
  });

  describe('Records', () => {
    describe('Ip Ban cleaner (Core)', () => {
      it('Should have name', () => expect(t.records['Ip Ban cleaner (Core)'].name).toEqual(find(records, { name: 'Ip Ban cleaner (Core)' }).name));
      it('Should have active', () => expect(t.records['Ip Ban cleaner (Core)'].active).toEqual(find(records, { name: 'Ip Ban cleaner (Core)' }).active));
      it('Should have reenable_end', () => expect(t.records['Ip Ban cleaner (Core)'].reenable_end).toEqual(find(records, { name: 'Ip Ban cleaner (Core)' }).reenable_end));
      it('Should have reenable_type', () => expect(t.records['Ip Ban cleaner (Core)'].reenable_type).toEqual(find(records, { name: 'Ip Ban cleaner (Core)' }).reenable_type));
      it('Should have reenable_every', () => expect(t.records['Ip Ban cleaner (Core)'].reenable_every).toEqual(find(records, { name: 'Ip Ban cleaner (Core)' }).reenable_every));
      it('Should have script', () => expect(t.records['Ip Ban cleaner (Core)'].script).toEqual(find(records, { name: 'Ip Ban cleaner (Core)' }).script));
      it('Should have core locks', () => {
        const record = t.records['Ip Ban cleaner (Core)'];
        const locks = filter(t.coreLocks, { record_id: record.id });

        const masterLocks = filter(locks, (lock) => !lock.field_update);
        const fieldsLocks = filter(locks, (lock) => lock.field_update);

        expect(masterLocks).toHaveLength(1);
        expect(masterLocks[0]).toMatchObject({ delete: true });

        expect(fieldsLocks).toHaveLength(map(t.fields, 'id').length - 1);
        expect(map(fieldsLocks, 'field_update').sort()).toEqual(map(filter(t.fields, (f, key) => key !== 'active'), 'id').sort());
      });
    });

    describe('Session cleaner (Core)', () => {
      it('Should have name', () => expect(t.records['Session cleaner (Core)'].name).toEqual(find(records, { name: 'Session cleaner (Core)' }).name));
      it('Should have active', () => expect(t.records['Session cleaner (Core)'].active).toEqual(find(records, { name: 'Session cleaner (Core)' }).active));
      it('Should have reenable_end', () => expect(t.records['Session cleaner (Core)'].reenable_end).toEqual(find(records, { name: 'Session cleaner (Core)' }).reenable_end));
      it('Should have reenable_type', () => expect(t.records['Session cleaner (Core)'].reenable_type).toEqual(find(records, { name: 'Session cleaner (Core)' }).reenable_type));
      it('Should have reenable_every', () => expect(t.records['Session cleaner (Core)'].reenable_every).toEqual(find(records, { name: 'Session cleaner (Core)' }).reenable_every));
      it('Should have script', () => expect(t.records['Session cleaner (Core)'].script).toEqual(find(records, { name: 'Session cleaner (Core)' }).script));
      it('Should have core locks', () => {
        const record = t.records['Session cleaner (Core)'];
        const locks = filter(t.coreLocks, { record_id: record.id });

        const masterLocks = filter(locks, (lock) => !lock.field_update);
        const fieldsLocks = filter(locks, (lock) => lock.field_update);

        expect(masterLocks).toHaveLength(1);
        expect(masterLocks[0]).toMatchObject({ delete: true });

        expect(fieldsLocks).toHaveLength(map(t.fields, 'id').length - 1);
        expect(map(fieldsLocks, 'field_update').sort()).toEqual(map(filter(t.fields, (f, key) => key !== 'active'), 'id').sort());
      });
    });
  });
});
