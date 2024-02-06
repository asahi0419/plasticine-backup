import { EMAIL_FORMAT } from './helpers.js';

export default {
  name: 'Password recovery page',
  alias: 'password_recovery',
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
    <Header as="h2" style={{ fontWeight: 'normal' }}>{p.translate('password_recovery', { defaultValue: 'Password recovery' })}</Header>
  </div>
  <Form>
    <div className="inputs">
      <Form.Field>
        <Form.Input
          type="text"
          error={page.state.errors.email}
          label={p.translate('system_account_associated_email', { defaultValue: 'Email associated with the system account' })}
          onChange={page.handleEmailChanged}
        />
      </Form.Field>
      <div className="inputs-buttons">
        <Button basic onClick={page.handleSubmit}>{p.translate('next_step', { defaultValue: 'Next step' })}</Button>
      </div>
    </div>
  </Form>
</div>`,
  access_script: `p.currentUser.isGuest() && p.getSetting('authorization.password.recovery')`,
  component_script: `{
  initState: () => ({
    email: '',
    settings: page.getSettings(),
    errors: { email: false },
  }),
  getSettings: () => ({
    allow_registration: false, ...p.getSetting('authorization'),
    project_name: p.getSetting('project_name'),
  }),
  handleEmailChanged: (_, { value: email }) => page.setState({ email }),
  isInputValid: () => {
    const { email, errors } = page.state;
    const errorMessages = [];

    if (!new RegExp(${EMAIL_FORMAT}).test(email)) {
      errors.email = true;
      errorMessages.push(p.translate('email_is_invalid', { defaultValue: 'Email is invalid' }));
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
  handleSubmit: () => page.isInputValid() && p.getAction('check_email')({ email: page.state.email }),
}`,
  actions: [
    {
      name: 'Check email',
      alias: 'check_email',
      condition_script: `p.getSetting('authorization.password.recovery')`,
      server_script: `const { email } = p.getRequest();

try {
  const accountProxy = await helpers.auth.findAccountByEmail(email, { ip_ban: { type: 'password_recovery_email_protection' } });

  const notAllowedStatuses = ['banned', 'disabled', 'inactive', 'waiting_confirmation', '']; 
  if(notAllowedStatuses.includes(accountProxy.getValue('status'))){
     throw new Error('Your account status has been suspended. Please contact system administrator for further instructions');  
  }
  
  const etoken = p.encryptor.encrypt(email);
  const gToken = p.encryptor.randomBytes();
  await accountProxy.sendSecurityCode('password recovery', etoken, gToken, { ignorePermissions: true });
  const process = 'password_recovery';

  p.actions.openPage('setup_new_password', { etoken, process, gToken });
} catch (error) {
  p.response.error(error)
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
