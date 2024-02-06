import { keyBy, find } from 'lodash-es';

import seed from '../17-planned-tasks.js';

const model = db.getModel('planned_task');
const { fields, layouts, forms, views, filters } = seed;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.views = keyBy(await db.model('view').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.forms = keyBy(await db.model('form').where({ model: model.id }), 'alias');
  t.filters = keyBy(await db.model('filter').where({ model: model.id }), 'name');
});

describe('Model: Planned task', () => {
  describe('Fields', () => {
    describe('Model', () => {
      it('Should have name', () => expect(t.fields['model'].name).toEqual(find(fields, { alias: 'model' }).name));
      it('Should have type', () => expect(t.fields['model'].type).toEqual(find(fields, { alias: 'model' }).type));
      it('Should have options', () => expect(JSON.parse(t.fields['model'].options)).toMatchObject(find(fields, { alias: 'model' }).options));
      it('Should be hidden', () => expect(t.fields['model'].hidden_when_script).toEqual(find(fields, { alias: 'model' }).hidden_when_script));
    });

    describe('Record', () => {
      it('Should have name', () => expect(t.fields['record'].name).toEqual(find(fields, { alias: 'record' }).name));
      it('Should have type', () => expect(t.fields['record'].type).toEqual(find(fields, { alias: 'record' }).type));
      it('Should have options', () => expect(t.fields['record'].options).toEqual(JSON.stringify(find(fields, { alias: 'record' }).options || {})));
      it('Should be hidden', () => expect(t.fields['record'].hidden_when_script).toEqual(find(fields, { alias: 'record' }).hidden_when_script));
    });

    describe('Escalation rule', () => {
      it('Should have name', () => expect(t.fields['escalation_rule'].name).toEqual(find(fields, { alias: 'escalation_rule' }).name));
      it('Should have type', () => expect(t.fields['escalation_rule'].type).toEqual(find(fields, { alias: 'escalation_rule' }).type));
      it('Should have options', () => expect(JSON.parse(t.fields['escalation_rule'].options)).toMatchObject(find(fields, { alias: 'escalation_rule' }).options || {}));
      it('Should be hidden', () => expect(t.fields['escalation_rule'].hidden_when_script).toEqual(find(fields, { alias: 'escalation_rule' }).hidden_when_script));
    });

    describe('Scheduled task', () => {
      it('Should have name', () => expect(t.fields['scheduled_task'].name).toEqual(find(fields, { alias: 'scheduled_task' }).name));
      it('Should have type', () => expect(t.fields['scheduled_task'].type).toEqual(find(fields, { alias: 'scheduled_task' }).type));
      it('Should have options', () => expect(JSON.parse(t.fields['scheduled_task'].options)).toMatchObject(find(fields, { alias: 'scheduled_task' }).options || {}));
      it('Should be hidden', () => expect(t.fields['scheduled_task'].hidden_when_script).toEqual(find(fields, { alias: 'scheduled_task' }).hidden_when_script));
    });

    describe('Scheduled on', () => {
      it('Should have name', () => expect(t.fields['scheduled_on'].name).toEqual(find(fields, { alias: 'scheduled_on' }).name));
      it('Should have type', () => expect(t.fields['scheduled_on'].type).toEqual(find(fields, { alias: 'scheduled_on' }).type));
      it('Should have options', () => expect(t.fields['scheduled_on'].options).toEqual(JSON.stringify(find(fields, { alias: 'scheduled_on' }).options || {})));
      it('Should be required', () => expect(t.fields['scheduled_on'].required_when_script).toEqual(find(fields, { alias: 'scheduled_on' }).required_when_script));
    });

    describe('Status', () => {
      it('Should have name', () => expect(t.fields['status'].name).toEqual(find(fields, { alias: 'status' }).name));
      it('Should have type', () => expect(t.fields['status'].type).toEqual(find(fields, { alias: 'status' }).type));
      it('Should have options', () => expect(t.fields['status'].options).toEqual(JSON.stringify(find(fields, { alias: 'status' }).options || {})));
      it('Should be required', () => expect(t.fields['status'].required_when_script).toEqual(find(fields, { alias: 'status' }).required_when_script));
    });

    describe('Timeout counter', () => {
      it('Should have name', () => expect(t.fields['timeout_counter'].name).toEqual(find(fields, { alias: 'timeout_counter' }).name));
      it('Should have type', () => expect(t.fields['timeout_counter'].type).toEqual(find(fields, { alias: 'timeout_counter' }).type));
      it('Should have options', () => expect(t.fields['timeout_counter'].options).toEqual(JSON.stringify(find(fields, { alias: 'timeout_counter' }).options || {})));
    });
  });

  describe('Views', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.views['default'].name).toEqual(find(views, { alias: 'default' }).name));
      it('Should have type', () => expect(t.views['default'].type).toEqual(find(views, { alias: 'default' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'default' }).layout));
      it('Should have filter', () => expect(t.filters['Default'].name).toEqual(find(views, { alias: 'default' }).filter));
      it('Should have condition script', () => expect(t.views['default'].condition_script).toEqual(find(views, { alias: 'default' }).condition_script));
    });
    describe('Rules', () => {
      it('Should have name', () => expect(t.views['rules'].name).toEqual(find(views, { alias: 'rules' }).name));
      it('Should have type', () => expect(t.views['rules'].type).toEqual(find(views, { alias: 'rules' }).type));
      it('Should have layout', () => expect(t.layouts['Rules'].name).toEqual(find(views, { alias: 'rules' }).layout));
      it('Should have filter', () => expect(t.filters['Rules'].name).toEqual(find(views, { alias: 'rules' }).filter));
      it('Should have condition script', () => expect(t.views['rules'].condition_script).toEqual(find(views, { alias: 'rules' }).condition_script));
    });
    describe('Tasks', () => {
      it('Should have name', () => expect(t.views['tasks'].name).toEqual(find(views, { alias: 'tasks' }).name));
      it('Should have type', () => expect(t.views['tasks'].type).toEqual(find(views, { alias: 'tasks' }).type));
      it('Should have layout', () => expect(t.layouts['Tasks'].name).toEqual(find(views, { alias: 'tasks' }).layout));
      it('Should have filter', () => expect(t.filters['Tasks'].name).toEqual(find(views, { alias: 'tasks' }).filter));
      it('Should have condition script', () => expect(t.views['tasks'].condition_script).toEqual(find(views, { alias: 'tasks' }).condition_script));
    });
  });

  describe('Layouts', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.layouts['Default'].name).toEqual(find(layouts, { name: 'Default' }).name));
      it('Should have type', () => expect(t.layouts['Default'].type).toEqual(find(layouts, { name: 'Default' }).type));
      it('Should have options', () => expect(t.layouts['Default'].options).toEqual(JSON.stringify(find(layouts, { name: 'Default' }).options)));
    });
    describe('Rules', () => {
      it('Should have name', () => expect(t.layouts['Rules'].name).toEqual(find(layouts, { name: 'Rules' }).name));
      it('Should have type', () => expect(t.layouts['Rules'].type).toEqual(find(layouts, { name: 'Rules' }).type));
      it('Should have options', () => expect(t.layouts['Rules'].options).toEqual(JSON.stringify(find(layouts, { name: 'Rules' }).options)));
    });
    describe('Tasks', () => {
      it('Should have name', () => expect(t.layouts['Tasks'].name).toEqual(find(layouts, { name: 'Tasks' }).name));
      it('Should have type', () => expect(t.layouts['Tasks'].type).toEqual(find(layouts, { name: 'Tasks' }).type));
      it('Should have options', () => expect(t.layouts['Tasks'].options).toEqual(JSON.stringify(find(layouts, { name: 'Tasks' }).options)));
    });
  });

  describe('Forms', () => {
    describe('Default', () => {
      it('Should have options', () => expect(t.forms['default'].options).toEqual(JSON.stringify(find(forms, { alias: 'default' }).options)));
    });
  });

  describe('Filters', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.filters['Default'].name).toEqual(find(filters, { name: 'Default' }).name));
      it('Should have query', () => expect(t.filters['Default'].query).toEqual(find(filters, { name: 'Default' }).query));
    });
    describe('Rules', () => {
      it('Should have name', () => expect(t.filters['Rules'].name).toEqual(find(filters, { name: 'Rules' }).name));
      it('Should have query', () => expect(t.filters['Rules'].query).toEqual(find(filters, { name: 'Rules' }).query));
    });
    describe('Tasks', () => {
      it('Should have name', () => expect(t.filters['Tasks'].name).toEqual(find(filters, { name: 'Tasks' }).name));
      it('Should have query', () => expect(t.filters['Tasks'].query).toEqual(find(filters, { name: 'Tasks' }).query));
    });
  });
});
