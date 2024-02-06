const { manager } = h.record;

const testPrivilegeAttributes = { owner_id: 3, owner_type: 'user', level: 'read_write' };

beforeAll(async () => {
  t.dtf_model = await manager('model').create();
  t.dvf_model = await manager('model').create();
  t.dtf_field = await manager('field').create({ model: t.dtf_model.id, type: 'data_template' });
  t.dvf_field = await manager('field').create({ model: t.dvf_model.id, type: 'data_visual' });

  t.dtf_record = await manager(t.dtf_model.alias).create();
  t.dtf_t_cross = await db.model('t_cross').where({ dtf_field_id: t.dtf_field.id }).getOne();

  const model = await db.model('model').where({ id: t.dtf_t_cross.data_model_id }).getOne();
  const field = await manager('field').create({ model: model.id, type: 'string' });
  const template = `{"attr":[{"f":${field.id},"p":-1}]}`;

  t.dvf_record = await manager(t.dvf_model.alias).create({ [t.dvf_field.alias]: template });
  t.dvf_t_cross = await db.model('t_cross').where({ dvf_field_id: t.dvf_field.id }).getOne();
});

describe('DB Rule: Privilege', () => {
  describe('processTemplatePrivileges(privilege, \'insert\')', () => {
    it('Should derive privilege to child models', async () => {
      t.privilege = await manager('privilege').create({ ...testPrivilegeAttributes, model: t.dvf_model.id });
      const privilege = await db.model('privilege').where({ ...testPrivilegeAttributes, model: t.dvf_t_cross.data_model_id }).getOne();
      expect(privilege).toBeDefined();
    });
  });
  describe('processTemplatePrivileges(privilege, \'delete\')', () => {
    it('Should delete privilege from child models', async () => {
      await manager('privilege').destroy(t.privilege);
      const privilege = await db.model('privilege').where({ ...testPrivilegeAttributes, model: t.dvf_t_cross.data_model_id }).getOne();
      expect(privilege).toBeUndefined();
    });
  });
});
