export default {
  name: 'Change password',
  alias: 'change_password',
  styles: `padding: 20px;

.container {
  width: 520px;
  padding-top: 150px;
  margin: 0 auto;
  vertical-align: middle;
}

.header {
  color: {headerBackground} !important;
  text-align: center;

  &:last-child {
    margin-bottom: 28px;
  }
}

.inputs .field {
  position: relative;
  margin-bottom: 14px;
  -webkit-text-security: disc;
}

.ui.form .field label {
  -webkit-text-security: none !important;
}

.ui.button {
  color: #ffffff !important;
  background-color: #416792 !important;
  text-shadow: none!important;
  font-weight: 400;
}

.inputs-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  margin-bottom: 1em;
}

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  display: flex;
  align-items: center;
  min-height: 100%;

  .container {
    width: 100%;
    padding-top: 0;
  }
}`,
  template: `<div className="container">
  <div className="header-container">
    <Header as="h1">{page.state.settings.project_name}</Header>
    <Header as="h2" style={{ fontWeight: 'normal' }}>{p.translate('change_password', { defaultValue: 'Change password' })}</Header>
  </div>
  <Form>
    <div className="inputs">
      <Form.Field>
        <Form.Input
          id = "passw_id"
          error={page.state.errors.currentPassword}
          label={p.translate('current_password', { defaultValue: 'Current password' })}
          type="text"
          autocomplete="new-password"
          onChange={page.handleCurrentPasswordChange}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          id = "new_passw_id"
          error={page.state.errors.password}
          label={p.translate('new_password', { defaultValue: 'New password' })}
          type="text"
          autocomplete="new-password"
          onChange={page.handleNewPasswordChange}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          id = "re_new_passw_id"
          error={page.state.errors.reEnteredPassword}
          label={p.translate('re_enter_password', { defaultValue: 'Re-enter password' })}
          type="text"
          autocomplete="new-password"
          onChange={page.handleReEnterPasswordChange}
        />
      </Form.Field>
    </div>
    <div className="inputs-buttons">
      <Button basic type="submit" onClick={page.handleSubmit}>{p.translate('save', { defaultValue: 'Save' })}</Button>
      <Button basic onClick={page.handleCancel}>{p.translate('cancel', { defaultValue: 'Cancel' })}</Button>
    </div>
  </Form>
</div>`,
  access_script: `!p.currentUser.isGuest()`,
  component_script: `{
  initState: () => ({
    currentPassword: '',
    password: '',
    reEnteredPassword: '',
    settings: page.getSettings(),
    errors: { currentPassword: false, password: false, reEnteredPassword: false },
  }),
  getSettings: () => ({
    password:{
      min_length: 8,
      max_length: 24
    },
    ...p.getSetting('authorization'),
    project_name: p.getSetting('project_name'),
  }),
  isInputValid: () => {
    const { currentPassword, password, reEnteredPassword, settings } = page.state;
    const errors = {};
    const errorMessages = [];

    !currentPassword && (errors.currentPassword = true);
    !password && (errors.password = true);
    !reEnteredPassword && (errors.reEnteredPassword = true);

    if (Object.values(errors).includes(true)) {
      errorMessages.push(p.translate('fill_all_fields', { defaultValue: 'Fill all the fields' }));
    }

    if (password !== reEnteredPassword) {
      errors.reEnteredPassword = true;
      errorMessages.push(p.translate('passwords_dont_match', { defaultValue: "Passwords don't match" }));
    }

    if (password.length < settings.password.min_length) {
      errors.password = true;
      errorMessages.push(p.translate('min_password_length', { defaultValue: 'Minimum password length: {{value}}', value: settings.password.min_length }));
    }

    if (password.length > settings.password.max_length) {
      errors.password = true;
      errorMessages.push(p.translate('max_password_length', { defaultValue: 'Maximum password length: {{value}}', value: settings.password.max_length }));
    }

    if (errorMessages.length) {
      page.setState({ errors });

      p.showMessage({
        type: 'negative',
        header: p.translate('authentication_error', { defaultValue: 'Authentication error' }),
        list: errorMessages,
      });

      return false;
    }

    return true;
  },
  handleCurrentPasswordChange: (_, { value: currentPassword }) => page.setState({ currentPassword }),
  handleNewPasswordChange: (_, { value: password }) => page.setState({ password }),
  handleReEnterPasswordChange: (_, { value: reEnteredPassword }) => page.setState({ reEnteredPassword }),
  handleSubmit: (e) => {
    e.preventDefault();
    document.getElementById("passw_id").setAttribute("type", "password"); 
    document.getElementById("new_passw_id").setAttribute("type", "password"); 
    document.getElementById("re_new_passw_id").setAttribute("type", "password");
    page.isInputValid() && p.getAction('submit_changed_password')({ currentPassword: page.state.currentPassword, password: page.state.password })
  },
  handleCancel: () => { 
    document.getElementById("passw_id").setAttribute("type", "text"); 
    document.getElementById("new_passw_id").setAttribute("type", "text"); 
    document.getElementById("re_new_passw_id").setAttribute("type", "text");
    p.actions.goBack()
  },
}`,
  actions: [
    {
      name: 'Submit changed password',
      alias: 'submit_changed_password',
      condition_script: 'true',
      server_script: `const { currentPassword, password }  = p.getRequest();
const account = p.currentUser.getAccount();

try {
  await account.changePassword(currentPassword, password);
  p.actions.logout({ message: p.translate('static.password_successfully_changed'), redirect: '/pages/login'  });
} catch (error) {
   p.actions.showMessage({
    type: 'negative',
    content: p.translate(error.description)
    })
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
