import { keyBy, find } from 'lodash-es';

import seed from '../49-user_position.js';

const { layouts, forms } = seed;

let model;

beforeAll(async () => {
  model = await db.model('model').where({ alias: 'user_position' }).getOne();

  t.fields = keyBy(await db.model('field').where({ model: model.id }), 'alias');
  t.views = keyBy(await db.model('view').where({ model: model.id }), 'alias');
  t.layouts = keyBy(await db.model('layout').where({ model: model.id }), 'name');
  t.forms = keyBy(await db.model('form').where({ model: model.id }), 'alias');
  t.permissions = await db.model('permission').where({ model: model.id });
});

describe('Model: User Position', () => {
  describe('Model', () => {
    it('Should have name: [MC] User Position', () => expect(model.name).toEqual('[MC] User Position'));
    it('Should have plural: [MC] User Positions', () => expect(model.plural).toEqual('[MC] User Positions'));
    it('Should have alias: user_position', () => expect(model.alias).toEqual('user_position'));
    it('Should have appropriate access_script', () => expect(model.access_script).toEqual('p.currentUser.canAtLeastRead()'));
  });

  describe('Fields', () => {
    describe('User', () => {
      it('Should have type [reference]', () => expect(t.fields['user_id'].type).toEqual('reference'));
      it('Should have options[foreign_model:user]', () => expect(JSON.parse(t.fields['user_id'].options).foreign_model).toEqual('user'));
      it('Should have options[foreign_label:{name} {surname}]', () => expect(JSON.parse(t.fields['user_id'].options).foreign_label).toEqual('{name} {surname}'));
      it('Should be required', () => expect(t.fields['user_id'].required_when_script).toEqual('true'));
    });

    describe('Accuracy', () => {
      it('Should have type [integer]', () => expect(t.fields['accuracy'].type).toEqual('integer'));
      it('Should be required', () => expect(t.fields['accuracy'].required_when_script).toEqual('true'));
    });

    describe('Longitude', () => {
      it('Should have type [float]', () => expect(t.fields['p_lon'].type).toEqual('float'));
      it('Should be required', () => expect(t.fields['p_lon'].required_when_script).toEqual('true'));
    });

    describe('Latitude', () => {
      it('Should have type [float]', () => expect(t.fields['p_lat'].type).toEqual('float'));
      it('Should be required', () => expect(t.fields['p_lon'].required_when_script).toEqual('true'));
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

  describe('Permissions', () => {
    describe('create', () => {
      const permission = find(t.permissions, { action: 'create', type: 'model' });
      it('Should have type:model and action:create', () => expect(find(t.permissions, {
        action: 'create',
        type: 'model'
      })).toBeDefined());
      it('Should have appropriate script', () => expect(find(t.permissions, {
        action: 'create',
        type: 'model'
      }).script).toEqual('p.currentUser.isAdmin()'));
    });
    describe('update', () => {
      it('Should have type:model and action:update', () => expect(find(t.permissions, {
        action: 'update',
        type: 'model'
      })).toBeDefined());
      it('Should have appropriate script', () => expect(find(t.permissions, {
        action: 'update',
        type: 'model'
      }).script).toEqual('p.currentUser.isAdmin()'));
    });
    describe('delete', () => {
      it('Should have type:model and action:delete', () => expect(find(t.permissions, {
        action: 'delete',
        type: 'model'
      })).toBeDefined());
      it('Should have appropriate script', () => expect(find(t.permissions, {
        action: 'delete',
        type: 'model'
      }).script).toEqual('p.currentUser.isAdmin()'));
    });
  });
});
