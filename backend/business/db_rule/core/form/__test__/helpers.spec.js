import * as HELPERS from '../helpers.js';
import * as CONSTANTS from '../../../../constants/index.js';

describe('DB Rule: Form', () => {
  describe('Helpers', () => {
    describe('processComponentsAttachmentsOptions(options)', () => {
      it('Should normalize attachments views', async () => {
        const model = db.getModel('attachment');
        const views = {
          last: await db.model('view').where({ model: model.id, alias: 'last_versions' }).getOne(),
          prev: await db.model('view').where({ model: model.id, alias: 'previous_versions' }).getOne(),
        };

        const options = { components: { options: { __attachments__: {
          last_versions_view: 'last_versions',
          previous_versions_view: 'previous_versions',
        } } } };

        await HELPERS.processComponentsAttachmentsOptions(options);

        expect(options.components.options.__attachments__.last_versions_view).toEqual(views.last.id);
        expect(options.components.options.__attachments__.previous_versions_view).toEqual(views.prev.id);
      });
    });

    describe('processComponentsWorklogOptions(options)', () => {
      it('Should normalize worklog options', async () => {
        let options;

        options = { components: { list: [], options: {} } };
        await HELPERS.processComponentsWorklogOptions(options);
        expect(options.components.options).toEqual({});

        options = { components: { list: ['__worklog__'], options: {} } };
        await HELPERS.processComponentsWorklogOptions(options);
        expect(options.components.options).toEqual({ __worklog__: { audit_text_pattern: CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN, audit_text_limit: CONSTANTS.DEFAULT_AUDIT_TEXT_LIMIT } });

        options = { components: { list: ['__worklog__'], options: { __worklog__: { audit_text_pattern: 'audit_text_pattern' } } } };
        await HELPERS.processComponentsWorklogOptions(options);
        expect(options.components.options).toEqual({ __worklog__: { audit_text_pattern: 'audit_text_pattern', audit_text_limit: CONSTANTS.DEFAULT_AUDIT_TEXT_LIMIT } });

        options = { components: { list: ['__worklog__'], options: { __worklog__: { audit_text_limit: 'string' } } } };
        await HELPERS.processComponentsWorklogOptions(options);
        expect(options.components.options).toEqual({ __worklog__: { audit_text_limit: 100, audit_text_pattern: CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN } });

        options = { components: { list: ['__worklog__'], options: { __worklog__: { audit_text_limit: '50' } } } };
        await HELPERS.processComponentsWorklogOptions(options);
        expect(options.components.options).toEqual({ __worklog__: { audit_text_limit: 50, audit_text_pattern: CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN } });

        options = { components: { list: ['__worklog__'], options: { __worklog__: { audit_text_limit: 50 } } } };
        await HELPERS.processComponentsWorklogOptions(options);
        expect(options.components.options).toEqual({ __worklog__: { audit_text_limit: 50, audit_text_pattern: CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN } });
      });
    });

    describe('cleanupComponentsOptions(options)', () => {
      it('Should cleanup components options', () => {
        const options = {
          components: { list: [], options: { __attachments__: {
            last_versions_view: 'last_versions',
            previous_versions_view: 'previous_versions',
          } } },
          related_components: { list: [], options: { __attachments__: {
            last_versions_view: 'last_versions',
            previous_versions_view: 'previous_versions',
          } } },
        };

        HELPERS.cleanupComponentsOptions(options);

        expect(options.components.options).toEqual({});
        expect(options.related_components.options).toEqual({});
      });
    });
  });
});
