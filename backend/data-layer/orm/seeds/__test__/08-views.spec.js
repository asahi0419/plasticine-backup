const viewModel = db.getModel('view');

describe('Layout field of View', () => {
  it('Layout field should be mandatory for Grid and Card', async () => {
    const field = await db.model('field').where({ model: viewModel.id, alias: 'layout' }).getOne();
    const required_when_script = `['grid', 'card'].includes(p.record.getValue('type'));`;

    expect(field.required_when_script).toEqual(required_when_script);
  });

  it('Layout field should be visible only for Grid and Card', async () => {
    const field = await db.model('field').where({ model: viewModel.id, alias: 'layout' }).getOne();
    const hidden_when_script = `!['grid', 'card'].includes(p.record.getValue('type'));`;

    expect(field.hidden_when_script).toEqual(hidden_when_script);
  });
});

describe('Condition field', () => {
  it('Condition script field should be condition', async () => {
    const field = await db.model('field').where({ model: viewModel.id, alias: 'condition_script' }).getOne();

    expect(field.type).toEqual('condition');
  });
});
