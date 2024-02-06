export default {
  name: 'Dialog: Select the Model',
  alias: 'dialog_select_the_model',
  server_script: `const params = p.getRequest()
const aliases = await Promise.filter(params.references || [], (alias) => p.checkAccess('model', { alias }))

const model = await p.getModel('model')
const records = await model.find({ alias: aliases }).order({ name: 'asc' }).raw()
const options = lodash.map(records, (r) => ({ value: r.alias, text: r.name }))

p.response.json({ options })`,
  component_script: `{
  initState: () => {
    return {
      options: p.getVariable('options')
    }
  },

  handleChange: (e, { value }) => {
    page.setState({ value });
  },
  
  handleCancel: () => {
    p.this.parent.close()
  },
  
  handleNext: () => {
    p.this.parent.close(page.state.value)
  }
}`,
  template: `<div className="content">
  <h2>{p.translate('select_the_model', { defaultValue: 'Select the model' })}:</h2>
  <Divider/>
  <Dropdown
    search
    selection
    value={page.state.value}
    options={page.state.options}
    onChange={page.handleChange}
  />
  <Divider/>
  <div className="actions-bar">
    <Button onClick={page.handleCancel}>
      {p.translate('cancel', { defaultValue: 'Cancel' })}
    </Button>
    <Button onClick={page.handleNext} disabled={!page.state.value} basic>
      {p.translate('next', { defaultValue: 'Next' })}>
    </Button>
  </div>
</div>`,
  access_script: '!p.currentUser.isGuest()',
  styles: `.content {
  padding: 20px 0;
}

.actions-bar {
  display: flex;
  justify-content: end;
}`,
  __lock: ['delete'],
};
