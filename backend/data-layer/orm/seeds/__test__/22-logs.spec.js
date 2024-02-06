import { keyBy, find } from 'lodash-es';

import seed from '../22-logs.js';

const model = db.getModel('log');
const { fields, layouts, forms, views, filters } = seed;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.views = keyBy(await db.model('view').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.forms = keyBy(await db.model('form').where({ model: model.id }), 'alias');
  t.filters = keyBy(await db.model('filter').where({ model: model.id }), 'name');
});

describe('Model: Log', () => {
  describe('Fields', () => {
    describe('UUID', () => {
      it('Should have name', () => expect(t.fields['uuid'].name).toEqual(find(fields, { alias: 'uuid' }).name));
      it('Should have type', () => expect(t.fields['uuid'].type).toEqual(find(fields, { alias: 'uuid' }).type));
      it('Should have options', () => expect(t.fields['uuid'].options).toEqual(JSON.stringify(find(fields, { alias: 'uuid' }).options)));
      it('Should have required_when_script', () => expect(t.fields['uuid'].required_when_script).toEqual(find(fields, { alias: 'uuid' }).required_when_script));
    });

    describe('Domain', () => {
      it('Should have name', () => expect(t.fields['domain'].name).toEqual(find(fields, { alias: 'domain' }).name));
      it('Should have type', () => expect(t.fields['domain'].type).toEqual(find(fields, { alias: 'domain' }).type));
      it('Should have index', () => expect(t.fields['domain'].index).toEqual(find(fields, { alias: 'domain' }).index));
      it('Should have options', () => expect(t.fields['domain'].options).toEqual(JSON.stringify(find(fields, { alias: 'domain' }).options || {})));
      it('Should have required_when_script', () => expect(t.fields['domain'].required_when_script).toEqual(find(fields, { alias: 'domain' }).required_when_script));
    });

    describe('Level', () => {
      it('Should have name', () => expect(t.fields['level'].name).toEqual(find(fields, { alias: 'level' }).name));
      it('Should have type', () => expect(t.fields['level'].type).toEqual(find(fields, { alias: 'level' }).type));
      it('Should have index', () => expect(t.fields['level'].index).toEqual(find(fields, { alias: 'level' }).index));
      it('Should have options', () => expect(t.fields['level'].options).toEqual(JSON.stringify(find(fields, { alias: 'level' }).options || {})));
      it('Should have required_when_script', () => expect(t.fields['level'].required_when_script).toEqual(find(fields, { alias: 'level' }).required_when_script));
    });

    describe('Trigger type', () => {
      it('Should have name', () => expect(t.fields['trigger_type'].name).toEqual(find(fields, { alias: 'trigger_type' }).name));
      it('Should have type', () => expect(t.fields['trigger_type'].type).toEqual(find(fields, { alias: 'trigger_type' }).type));
      it('Should have index', () => expect(t.fields['trigger_type'].index).toEqual(find(fields, { alias: 'trigger_type' }).index));
    });

    describe('Trigger ID', () => {
      it('Should have name', () => expect(t.fields['trigger_id'].name).toEqual(find(fields, { alias: 'trigger_id' }).name));
      it('Should have type', () => expect(t.fields['trigger_id'].type).toEqual(find(fields, { alias: 'trigger_id' }).type));
    });

    describe('Target model', () => {
      it('Should have name', () => expect(t.fields['target_model'].name).toEqual(find(fields, { alias: 'target_model' }).name));
      it('Should have type', () => expect(t.fields['target_model'].type).toEqual(find(fields, { alias: 'target_model' }).type));
      it('Should have options', () => expect(JSON.parse(t.fields['target_model'].options)).toMatchObject(find(fields, { alias: 'target_model' }).options || {}));
      it('Should be hidden_when_script', () => expect(t.fields['target_model'].hidden_when_script).toEqual(find(fields, { alias: 'target_model' }).hidden_when_script));
    });

    describe('Target record', () => {
      it('Should have name', () => expect(t.fields['target_record'].name).toEqual(find(fields, { alias: 'target_record' }).name));
      it('Should have type', () => expect(t.fields['target_record'].type).toEqual(find(fields, { alias: 'target_record' }).type));
      it('Should be hidden_when_script', () => expect(t.fields['target_record'].hidden_when_script).toEqual(find(fields, { alias: 'target_record' }).hidden_when_script));
    });

    describe('Message', () => {
      it('Should have name', () => expect(t.fields['message'].name).toEqual(find(fields, { alias: 'message' }).name));
      it('Should have type', () => expect(t.fields['message'].type).toEqual(find(fields, { alias: 'message' }).type));
      it('Should have options', () => expect(t.fields['message'].options).toEqual(JSON.stringify(find(fields, { alias: 'message' }).options || {})));
      it('Should have required_when_script', () => expect(t.fields['message'].required_when_script).toEqual(find(fields, { alias: 'message' }).required_when_script));
    });

    describe('Meta', () => {
      it('Should have name', () => expect(t.fields['meta'].name).toEqual(find(fields, { alias: 'meta' }).name));
      it('Should have type', () => expect(t.fields['meta'].type).toEqual(find(fields, { alias: 'meta' }).type));
      it('Should have options', () => expect(t.fields['meta'].options).toEqual(JSON.stringify(find(fields, { alias: 'meta' }).options || {})));
    });

    describe('Timestamp', () => {
      it('Should have name', () => expect(t.fields['timestamp'].name).toEqual(find(fields, { alias: 'timestamp' }).name));
      it('Should have type', () => expect(t.fields['timestamp'].type).toEqual(find(fields, { alias: 'timestamp' }).type));
      it('Should have required_when_script', () => expect(t.fields['timestamp'].required_when_script).toEqual(find(fields, { alias: 'timestamp' }).required_when_script));
    });

    describe('Tag', () => {
      it('Should have name', () => expect(t.fields['tag'].name).toEqual(find(fields, { alias: 'tag' }).name));
      it('Should have type', () => expect(t.fields['tag'].type).toEqual(find(fields, { alias: 'tag' }).type));
    });
  });

  describe('Views', () => {
    describe('Default', () => {
      it('Should have name', () => expect(t.views['default'].name).toEqual(find(views, { alias: 'default' }).name));
      it('Should have type', () => expect(t.views['default'].type).toEqual(find(views, { alias: 'default' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'default' }).layout));
      it('Should have filter', () => expect(t.filters['Default'].name).toEqual(find(views, { alias: 'default' }).filter));
      it('Should have order', () => expect(t.views['default'].order).toEqual(find(views, { alias: 'default' }).order));
      it('Should have condition script', () => expect(t.views['default'].condition_script).toEqual(find(views, { alias: 'default' }).condition_script));
    });
    describe('Web', () => {
      it('Should have name', () => expect(t.views['web'].name).toEqual(find(views, { alias: 'web' }).name));
      it('Should have type', () => expect(t.views['web'].type).toEqual(find(views, { alias: 'web' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'web' }).layout));
      it('Should have filter', () => expect(t.filters['Web'].name).toEqual(find(views, { alias: 'web' }).filter));
      it('Should have order', () => expect(t.views['web'].order).toEqual(find(views, { alias: 'web' }).order));
      it('Should have condition script', () => expect(t.views['web'].condition_script).toEqual(find(views, { alias: 'web' }).condition_script));
    });
    describe('BG: Tasks', () => {
      it('Should have name', () => expect(t.views['background_tasks'].name).toEqual(find(views, { alias: 'background_tasks' }).name));
      it('Should have type', () => expect(t.views['background_tasks'].type).toEqual(find(views, { alias: 'background_tasks' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'background_tasks' }).layout));
      it('Should have filter', () => expect(t.filters['BG: Tasks'].name).toEqual(find(views, { alias: 'background_tasks' }).filter));
      it('Should have order', () => expect(t.views['background_tasks'].order).toEqual(find(views, { alias: 'background_tasks' }).order));
      it('Should have condition script', () => expect(t.views['background_tasks'].condition_script).toEqual(find(views, { alias: 'background_tasks' }).condition_script));
    });
    describe('BG: Mails', () => {
      it('Should have name', () => expect(t.views['background_mails'].name).toEqual(find(views, { alias: 'background_mails' }).name));
      it('Should have type', () => expect(t.views['background_mails'].type).toEqual(find(views, { alias: 'background_mails' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'background_mails' }).layout));
      it('Should have filter', () => expect(t.filters['BG: Mails'].name).toEqual(find(views, { alias: 'background_mails' }).filter));
      it('Should have order', () => expect(t.views['background_mails'].order).toEqual(find(views, { alias: 'background_mails' }).order));
      it('Should have condition script', () => expect(t.views['background_mails'].condition_script).toEqual(find(views, { alias: 'background_mails' }).condition_script));
    });
    describe('BG: All', () => {
      it('Should have name', () => expect(t.views['background_all'].name).toEqual(find(views, { alias: 'background_all' }).name));
      it('Should have type', () => expect(t.views['background_all'].type).toEqual(find(views, { alias: 'background_all' }).type));
      it('Should have layout', () => expect(t.layouts['Default'].name).toEqual(find(views, { alias: 'background_all' }).layout));
      it('Should have filter', () => expect(t.filters['BG: All'].name).toEqual(find(views, { alias: 'background_all' }).filter));
      it('Should have order', () => expect(t.views['background_all'].order).toEqual(find(views, { alias: 'background_all' }).order));
      it('Should have condition script', () => expect(t.views['background_all'].condition_script).toEqual(find(views, { alias: 'background_all' }).condition_script));
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

  describe('Filters', () => {
    describe('Web', () => {
      it('Should have name', () => expect(t.filters['Web'].name).toEqual(find(filters, { name: 'Web' }).name));
      it('Should have query', () => expect(t.filters['Web'].query).toEqual(find(filters, { name: 'Web' }).query));
    });
    describe('BG: Tasks', () => {
      it('Should have name', () => expect(t.filters['BG: Tasks'].name).toEqual(find(filters, { name: 'BG: Tasks' }).name));
      it('Should have query', () => expect(t.filters['BG: Tasks'].query).toEqual(find(filters, { name: 'BG: Tasks' }).query));
    });
    describe('BG: Mails', () => {
      it('Should have name', () => expect(t.filters['BG: Mails'].name).toEqual(find(filters, { name: 'BG: Mails' }).name));
      it('Should have query', () => expect(t.filters['BG: Mails'].query).toEqual(find(filters, { name: 'BG: Mails' }).query));
    });
    describe('BG: All', () => {
      it('Should have name', () => expect(t.filters['BG: All'].name).toEqual(find(filters, { name: 'BG: All' }).name));
      it('Should have query', () => expect(t.filters['BG: All'].query).toEqual(find(filters, { name: 'BG: All' }).query));
    });
  });
});
