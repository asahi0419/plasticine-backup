import * as MIDDLEWARES from '../middlewares/index.js';
import * as SESSION from '../../../business/user/session.js';

const { manager } = h.record;

beforeAll(async () => {
  t.m = {};
  t.m.f = await manager('model').create(),
  t.m.s = await manager('model').create(),

  t.f = { f: {}, s: {} };
  t.f.s.asm = await manager('field').create({ model: t.m.s.id, type: 'array_string', options: JSON.stringify({ values: { one: 'One', two: 'Two' }, multi_select: true }) });
  t.f.s.rtl = await manager('field').create({ model: t.m.s.id, type: 'reference_to_list', options: JSON.stringify({ foreign_model: t.m.f.alias, foreign_label: 'id' }) });

  t.r = { f: {}, s: {} };
  t.r.f.r1 = await manager(t.m.f.alias).create();
  t.r.s.r1 =await manager(t.m.s.alias).create({ [t.f.s.asm.alias]: ['one', 'two'], [t.f.s.rtl.alias]: [t.r.f.r1.id] });
});

describe('Presentation', () => {
  describe('Server', () => {
    describe('Middlewares', () => {
      describe('checkSession(req, res, next)', () => {
        it('Should correctly run', async () => {
          let req, res = { status: () => ({ json: jest.fn() }) }, next = jest.fn();
          SESSION.touchSession = jest.fn(() => Promise.resolve());
          MIDDLEWARES.__loadSandbox = jest.fn(() => Promise.resolve());

          req = { t: jest.fn(), query: {}, headers: {}, user: { __session: undefined } };
          expect(await MIDDLEWARES.checkSession(req, res, next)).toEqual();

          req = { t: jest.fn(), query: {}, headers: {}, user: { __session: {} } };
          await MIDDLEWARES.checkSession(req, res, next);
          expect(SESSION.touchSession).toBeCalled();
          expect(next).toBeCalled();
          jest.clearAllMocks();

          req = { t: jest.fn(), query: {}, headers: {}, user: { __userGroups: [{ alias: '__public' }] } };
          await MIDDLEWARES.checkSession(req, res, next);
          expect(SESSION.touchSession).not.toBeCalled();
          expect(next).toBeCalled();
          jest.clearAllMocks();

          req = {
            t: jest.fn(),
            user: { __authType: 'static_token' },
            query: { session: undefined },
            headers: {},
          };
          await MIDDLEWARES.checkSession(req, res, next);
          expect(SESSION.touchSession).not.toBeCalled();
          expect(next).toBeCalled();
          jest.clearAllMocks();

          req = {
            t: jest.fn(),
            user: { id: sandbox.user.id, __authType: 'static_token', __session: {} },
            query: { session: 'true' },
            app: { sandbox },
            headers: {},
            __meta: {},
          };
          await MIDDLEWARES.checkSession(req, res, next);
          expect(SESSION.touchSession).toBeCalled();
          expect(next).toBeCalled();
          jest.clearAllMocks();
        });
      });

      describe('findRecord(req, res, next)', () => {
        it('Should preprocess complex attributes', async () => {
          let req, res, next = jest.fn();

          req = { t: jest.fn(), query: {}, headers: {}, model: t.m.s, params: { id: t.r.s.r1.id } };
          res = { status: () => ({ json: jest.fn() }), error: jest.fn() };
          await MIDDLEWARES.findRecord(req, res, next);
          expect(req.record[t.f.s.asm.alias]).toEqual(['one', 'two']);
          expect(req.record[t.f.s.rtl.alias]).toEqual([t.r.f.r1.id]);
        });
      });

      describe('findParent(req, res, next)', () => {
        it('Should preprocess complex attributes', async () => {
          let req, res, next = jest.fn();

          req = { t: jest.fn(), query: {}, headers: {}, model: t.m.s, body: { embedded_to: { model: t.m.s.id, record_id: t.r.s.r1.id } } };
          res = { status: () => ({ json: jest.fn() }), error: jest.fn() };
          await MIDDLEWARES.findParent(req, res, next);
          expect(req.parentRecord[t.f.s.asm.alias]).toEqual(['one', 'two']);
          expect(req.parentRecord[t.f.s.rtl.alias]).toEqual([t.r.f.r1.id]);
        });
      });
    });
  });
});
