import loadUser from '../user/index.js';
import * as USER from '../user/index.js';

const DEFAULT_USER = {
  account: {},
  language: {},
  options: {},
  __permissions: [],
  __privileges: [],
  __userGroups: [],
};
const DEFAULT_REQ = { query: {}, user: DEFAULT_USER };
const DEFAULT_RES = { json: () => null, error: () => null };

describe('Server API', () => {
  describe('Commands', () => {
    describe('Load', () => {
      describe('User', () => {
        describe('loadUserData(req)', () => {
          it(`Should load user data`, async () => {
            let result = await USER.loadUserData();
            expect(result.attributes).toBeDefined();
            expect(result.user_groups).toBeDefined();
            expect(result.permissions).toBeDefined();
            expect(result.privileges).toBeDefined();
            expect(result.language).toBeDefined();
            expect(result.account).toBeDefined();
            expect(result.options).toBeDefined();
            expect(result.account.__is_guest).not.toBeDefined();

            result = await USER.loadUserData({ user: {
              ...DEFAULT_USER,
              account: { email: 'guest@free.man' },
            } });
            expect(result.account.__is_guest).toEqual(true);
          });
        });
        describe('loadUserDetailsData(req)', () => {
          it(`Should load user details data`, async () => {
            let req, result;

            req = { user: DEFAULT_USER, query: { type: 'user_permissions' } }
            result = USER.loadUserDetailsData(req);
            expect(result.permissions).toBeDefined();

            req = { user: DEFAULT_USER, query: { type: 'user_privileges' } }
            result = USER.loadUserDetailsData(req);
            expect(result.privileges).toBeDefined();

            req = { user: DEFAULT_USER, query: { type: 'user_groups' } }
            result = USER.loadUserDetailsData(req);
            expect(result.user_groups).toBeDefined();
          });
        });
        describe('loadUser(req)', () => {
          it(`Should send json result`, async () => {
            jest.spyOn(DEFAULT_RES, 'json');
            await loadUser(DEFAULT_REQ, DEFAULT_RES);
            expect(DEFAULT_RES.json).toBeCalled();
          });
        });
      });
    });
  });
});
