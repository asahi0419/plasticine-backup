import { keyBy, find } from 'lodash-es';

import seed from '../45-sandboxes.js';

const model = db.getModel('sandbox');
const { fields, layouts, forms, actions } = seed;

beforeAll(async () => {
  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.views = keyBy(await db.model('view').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.forms = keyBy(await db.model('form').where({ model: model.id }), 'alias');
  t.actions = keyBy(await db.model('action').where({ model: model.id }), 'alias');
});

describe('Model: Sandbox', () => {
  describe('Fields', () => {
    describe('Name', () => {
      it('Should have type [string]', () => expect(t.fields['name'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['name'].options).toEqual(JSON.stringify({ length: 255 })));
      it('Should be required', () => expect(t.fields['name'].required_when_script).toEqual('true'));
    });

    describe('Script', () => {
      it('Should have type [string]', () => expect(t.fields['script'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['script'].options).toEqual(JSON.stringify({ length: 150000, rows: 20, syntax_hl: 'js' })));
      it('Should be required', () => expect(t.fields['script'].required_when_script).toEqual('true'));
    });

    describe('Result', () => {
      it('Should have type [string]', () => expect(t.fields['result'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['result'].options).toEqual(JSON.stringify({ length: 100000, rows: 15, syntax_hl: 'json' })));
    });

    describe('Expected result', () => {
      it('Should have type [string]', () => expect(t.fields['exp_result'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['exp_result'].options).toEqual(JSON.stringify({ length: 100000, rows: 15, syntax_hl: 'json' })));
    });

    describe('Status', () => {
      it('Should have type [array_string]', () => expect(t.fields['status'].type).toEqual('array_string'));
      it('Should have options', () => expect(t.fields['status'].options).toEqual(JSON.stringify({ values: { ok: 'OK', pass: 'PASS', not_pass: 'NOT PASS', error: 'ERROR' }, length: 2048 })));
    });

    describe('Message', () => {
      it('Should have type [string]', () => expect(t.fields['message'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['message'].options).toEqual(JSON.stringify({ length: 100000, rows: 5 })));
    });

    describe('Tag', () => {
      it('Should have type [string]', () => expect(t.fields['tag'].type).toEqual('string'));
      it('Should have options', () => expect(t.fields['tag'].options).toEqual(JSON.stringify({ length: 255 })));
    });

    describe('Exec time (ms)', () => {
      it('Should have type [integer]', () => expect(t.fields['exec_time'].type).toEqual('integer'));
    });

    describe('Order', () => {
      it('Should have type [integer]', () => expect(t.fields['order'].type).toEqual('integer'));
      it('Should have options', () => expect(t.fields['order'].options).toEqual(JSON.stringify({ default: 0 })));
    });
  });

  describe('Views', () => {
    describe('Default', () => {
      it('Should exists', () => expect(t.views['default']).toBeDefined());
    });
  });

  describe('Layouts', () => {
    describe('Default', () => {
      it('Should have options', () => expect(t.layouts['Default'].options).toEqual(JSON.stringify(find(layouts, { name: 'Default' }).options)));
    });
  });

  describe('Forms', () => {
    describe('Default', () => {
      it('Should have options', () => expect(t.forms['default'].options).toEqual(JSON.stringify(find(forms, { alias: 'default' }).options)));
    });
  });

  describe('Actions', () => {
    describe('Run', () => {
      it('Should have server_script', () => expect(t.actions['run'].server_script).toEqual(find(actions, { alias: 'run' }).server_script));
      it('Should have condition_script', () => expect(t.actions['run'].condition_script).toEqual(find(actions, { alias: 'run' }).condition_script));
      it('Should have type [form_button]', () => expect(t.actions['run'].type).toEqual(find(actions, { alias: 'run' }).type));
      it('Should have on_insert', () => expect(t.actions['run'].on_insert).toEqual(find(actions, { alias: 'run' }).on_insert));
      it('Should have on_update', () => expect(t.actions['run'].on_update).toEqual(find(actions, { alias: 'run' }).on_update));
    });
  });
});
