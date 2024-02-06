import { modifyScriptWithModelPrivileges, checkPrivilege } from '../privileges';

describe('Security', () => {
  describe('Privileges', () => {
    describe('modifyScriptWithModelPrivileges(script, modelId)', () => {
      it(`Should replace sources globally`, () => {
        const script = 'p.currentUser.canUpdate() && p.currentUser.canUpdate()';
        const modelId = 1;

        const result = modifyScriptWithModelPrivileges(script, modelId);
        const expected = `p.currentUser.canUpdate(${modelId}) && p.currentUser.canUpdate(${modelId})`;

        expect(result).toEqual(expected);
      });
    });

    describe('checkPrivilege(user, level, model)', () => {
      it(`Should check user privilege by level`, () => {
        const model = 1;
        const level = 'admin';
        const user = { privileges: [
          { level: 'none', model_id: model },
          { level: 'read', model_id: model },
          { level: 'read_write', model_id: model },
          { level: 'admin', model_id: model },
        ] };

        const result = checkPrivilege(user, level, model);
        const expected = true;

        expect(result).toEqual(expected);
      });
      it(`Should return false if level does not exist`, () => {
        const model = 1;
        const level = 'level';
        const user = { privileges: [
          { level: 'none', model_id: model },
          { level: 'read', model_id: model },
          { level: 'read_write', model_id: model },
          { level: 'admin', model_id: model },
        ] };

        const result = checkPrivilege(user, level, model);
        const expected = false;

        expect(result).toEqual(expected);
      });
      it(`Should ingore all users privilege if user has user owner`, () => {
        const model = 1;
        const level = 'admin';
        const user = { privileges: [
          { level: 'none', model_id: model, owner_type: 'all_users' },
          { level: 'read', model_id: model, owner_type: 'user' },
          { level: 'read_write', model_id: model, owner_type: 'user' },
          { level: 'admin', model_id: model, owner_type: 'user' },
        ] };

        const result = checkPrivilege(user, level, model);
        const expected = true;

        expect(result).toEqual(expected);
      });
      it(`Should ingore all users privilege if user has user group owner`, () => {
        const model = 1;
        const level = 'admin';
        const user = { privileges: [
          { level: 'none', model_id: model, owner_type: 'all_users' },
          { level: 'read', model_id: model, owner_type: 'user_group' },
          { level: 'read_write', model_id: model, owner_type: 'user_group' },
          { level: 'admin', model_id: model, owner_type: 'user_group' },
        ] };

        const result = checkPrivilege(user, level, model);
        const expected = true;

        expect(result).toEqual(expected);
      });
      it(`Should apply all users privilege no user or user group owner`, () => {
        const model = 1;
        const level = 'admin';
        const user = { privileges: [
          { level: 'none', model_id: model },
          { level: 'read', model_id: model },
          { level: 'read_write', model_id: model },
          { level: 'admin', model_id: model, owner_type: 'all_users' },
        ] };

        const result = checkPrivilege(user, level, model);
        const expected = true;

        expect(result).toEqual(expected);
      });
    });
  });
});
