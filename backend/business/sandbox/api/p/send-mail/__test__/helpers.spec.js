import lodash from 'lodash-es';

import { ParamsNotValidError } from '../../../../../error/index.js';
import { validateParams, linkAttachments } from '../helpers';

const FIELDS = [
  { alias: 'to' },
  { alias: 'subject' },
  { alias: 'body' },
];
const KEYS = FIELDS.map(({ alias }) => alias);

describe('p.sendMail', () => {
  describe('Helpers', () => {
    describe('validateParams(params)', () => {
      it('Should validate params', async () => {
        expect(() => validateParams({}, FIELDS, KEYS)).toThrow();
        expect(() => validateParams({ to: 'to' }, FIELDS, KEYS)).toThrow();
        expect(() => validateParams({ subject: 'subject' }, FIELDS, KEYS)).toThrow();
        expect(() => validateParams({ body: 'body' }, FIELDS, KEYS)).toThrow();
        expect(() => validateParams({ to: 'to', subject: 'subject' }, FIELDS, KEYS)).toThrow();
        expect(() => validateParams({ to: 'to', body: 'body' }, FIELDS, KEYS)).toThrow();
        expect(() => validateParams({ subject: 'subject', body: 'body' }, FIELDS, KEYS)).toThrow();

        expect(() => validateParams({ to: 'to', subject: 'subject', body: 'body' }, FIELDS, KEYS)).not.toThrow();
      });
    });

    describe('linkAttachments(record, attachments, sandbox)', () => {
      it('Should return nothing if attachments is not an array', async () => {
        const record = {};
        const attachments = '';

        const result = await linkAttachments(record, attachments);
        const expected = false;

        expect(result).toEqual(expected);
      });

      it('Should return nothing if attachments is empty array', async () => {
        const record = {};
        const attachments = [];

        const result = await linkAttachments(record, attachments);
        const expected = false;

        expect(result).toEqual(expected);
      });

      it('Should properly run', async () => {
        const linkTo = jest.fn();

        const record = {};
        const attachments = [
          { linkTo },
          { linkTo }
        ];

        const result = await linkAttachments(record, attachments);
        const expected = true;

        expect(result).toEqual(expected);
        expect(linkTo).toBeCalledTimes(2);
      });
    });
  });
});
