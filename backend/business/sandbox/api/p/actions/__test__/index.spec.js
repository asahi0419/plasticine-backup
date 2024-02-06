import ActionsNamespace from '../index.js';
import serializer from '../../../../../record/serializer/json';
import * as HELPERS from '../helpers';

class RecordProxy {
  constructor(context) {
    this.attributes = context.attributes;
  }
};

class ModelProxy {
  constructor(context) {
    this.model = context.model;
  }
};

const json = jest.fn();
const status = jest.fn(() => ({ json }));
const request = { body: {} };
const response = { status };

const getActions = () => ActionsNamespace({ request, response }, sandbox);

afterEach(() => jest.clearAllMocks());

describe('p.actions', () => {
  describe('ActionsNamespace', () => {
    describe('openForm(model, ...args)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const model = db.getModel('model');
        const alias = 'default';
        const record = {};
        const options = { associate: 'associate' };

        await actions.openForm(model, alias, record, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_form',
          options: {
            model: model.alias,
            form: alias,
            record: serializer(record),
            options,
          },
        });
      });

      it('Should correctly run [first available]', async () => {
        const actions = getActions();
        const model = db.getModel('model');
        const record = {};

        jest.spyOn(HELPERS, 'findFirstAvailableResource');
        jest.spyOn(sandbox, 'assignRecord');

        await actions.openForm(model, record);

        expect(sandbox.assignRecord).toBeCalledWith(record, model);
        expect(HELPERS.findFirstAvailableResource).toBeCalledWith(model.alias, 'form', sandbox);
        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_form',
          options: {
            model: model.alias,
            form: 'default',
            record: serializer(record),
            options: {},
          },
        });
      });

      it('Should be able to consume record proxies', async () => {
        const actions = getActions();
        const model = db.getModel('model');
        const alias = 'default';
        const record = new RecordProxy({ attributes: {} });
        const options = { associate: 'associate' };

        await actions.openForm(model, alias, record, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_form',
          options: {
            model: model.alias,
            form: alias,
            record: serializer(record.attributes),
            options,
          },
        });
      });

      it('Should be able to consume model proxies', async () => {
        const actions = getActions();
        const model = new ModelProxy({ model: db.getModel('model') });
        const alias = 'default';
        const record = new RecordProxy({ attributes: {} });
        const options = { associate: 'associate' };

        await actions.openForm(model, alias, record, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_form',
          options: {
            model: model.model.alias,
            form: alias,
            record: serializer(record.attributes),
            options,
          },
        });
      });

      it('Should throw error if no record specified', async () => {
        const actions = getActions();
        const result = actions.openForm(db.getModel('model'), 'default');

        await expect(result).rejects.toMatchObject({ name: 'RecordNotFoundError' });
      });
    });

    describe('openView(model, ...args)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const model = db.getModel('model');
        const alias = 'default';
        const options = {};

        await actions.openView(model, alias, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_view',
          options: {
            model: model.alias,
            view: alias,
            options,
          },
        });
      });

      it('Should correctly run [first available]', async () => {
        const actions = getActions();
        const model = db.getModel('model');

        jest.spyOn(HELPERS, 'findFirstAvailableResource');

        await actions.openView(model);

        expect(HELPERS.findFirstAvailableResource).toBeCalledWith(model.alias, 'view', sandbox);
        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_view',
          options: {
            model: model.alias,
            view: 'default',
            options: {},
          },
        });
      });

      it('Should be able to consume record proxies', async () => {
        const actions = getActions();
        const model = db.getModel('model');
        const alias = 'default';
        const options = {};

        await actions.openView(model, alias, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_view',
          options: {
            model: model.alias,
            view: alias,
            options,
          },
        });
      });

      it('Should be able to consume model proxies', async () => {
        const actions = getActions();
        const model = new ModelProxy({ model: db.getModel('model') });
        const alias = 'default';
        const options = {};

        await actions.openView(model, alias, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_view',
          options: {
            model: model.model.alias,
            view: alias,
            options,
          },
        });
      });

      it('Should be able to open self view', async () => {
        const actions = getActions();
        const alias = '__self';
        const options = {};

        await actions.openView(alias, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_self_view',
          options: { options },
        });
      });
    });

    describe('openPage(pageAlias, options)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const alias = 'default';
        const options = {};

        await actions.openPage(alias, options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_page',
          options: {
            page: alias,
            options,
          },
        });
      });
    });

    describe('openURL(url)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const url = 'default';

        await actions.openURL(url);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'open_url',
          options: { url },
        });
      });
    });

    describe('goBack(options)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const options = {};

        await actions.goBack(options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'go_back',
          options: HELPERS.prepareGoBackOptions(actions, options),
        });
      });
    });

    describe('showMessage(message)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const message = 'message';

        await actions.showMessage(message);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'show_message',
          options: { message },
        });
      });
    });

    describe('downloadFile(attachment)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const attachment = { id: 'id', file_name: 'file_name' };

        await actions.downloadFile({ attributes: attachment });

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'download_file',
          options: { attachment },
        });
      });
    });

    describe('logout(options)', () => {
      it('Should correctly run', async () => {
        const actions = getActions();
        const options = {};

        await actions.logout(options);

        expect(status).toBeCalledWith(200);
        expect(json).toBeCalledWith({
          action: 'logout',
          options,
        });
      });
    });
  });
});
