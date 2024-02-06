import { EMAIL_FORMAT } from './helpers.js';

export default {
  name: 'Create account page',
  alias: 'create_account',
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
    <Header as="h2" style={{ fontWeight: 'normal' }}>{p.translate('create_account', { defaultValue: 'Create account' })}</Header>
  </div>
  <Form>
    <div className="inputs">
      <Form.Field>
        <Form.Input
          type="text"
          error={page.state.errors.email}
          onChange={page.handleEmailChanged}
          label={p.translate('email', { defaultValue: 'Email' })}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          type="password"
          error={page.state.errors.password}
          onChange={page.handlePasswordChanged}
          label={p.translate('password', { defaultValue: 'Password' })}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          type="password"
          error={page.state.errors.reEnteredPassword}
          onChange={page.handleReEnterPasswordChanged}
          label={p.translate('re_enter_password', { defaultValue: 'Re-enter password' })}
        />
      </Form.Field>
      <div className="inputs-buttons">
        <Button basic onClick={page.handleSubmit}>
          {p.translate('create_and_verify_email', { defaultValue: 'Create and verify email' })}
        </Button>
      </div>
    </div>
  </Form>
</div>`,
  access_script: `p.currentUser.isGuest() && p.getSetting('authorization.allow_registration')`,
  component_script: `{
  initState: () => ({
    email: '',
    password: '',
    reEnteredPassword: '',
    settings: page.getSettings(),
    errors: { email: false, password: false, reEnteredPassword: false },
  }),
  getSettings: () => ({
    allow_registration: false,
    password:{
      min_length: 8,
      max_length: 24
    },
    ...p.getSetting('authorization'),
    project_name: p.getSetting('project_name'),
  }),
  isInputValid: () => {
    const { email, password, reEnteredPassword, settings, errors } = page.state;
    const errorMessages = [];

    if (!email || !password || !reEnteredPassword) {
      errorMessages.push(p.translate('fill_all_fields', { defaultValue: 'Fill all the fields' }));
    }

    if (!new RegExp(${EMAIL_FORMAT}).test(email)) {
      errors.email = true;
      errorMessages.push(p.translate('email_is_invalid', { defaultValue: 'Email is invalid' }));
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
  handleEmailChanged: (_, { value: email }) => page.setState({ email }),
  handlePasswordChanged: (_, { value: password }) => page.setState({ password }),
  handleReEnterPasswordChanged: (_, { value: reEnteredPassword }) => page.setState({ reEnteredPassword }),
  handleSubmit: () => page.isInputValid() && p.getAction('create_and_verify_email')({ email: page.state.email, password: page.state.password }),
}`,
  actions: [
    {
      name: 'Create and verify email',
      alias: 'create_and_verify_email',
      condition_script: 'true',
      server_script: `const { email, password } = p.getRequest();

try {
  const token = p.encryptor.encrypt(email);
  const process = 'create_account';
  const account = await helpers.auth.createAccount(email, password);

  await account.sendSecurityCode('email confirmation');
  await account.update({ status: 'waiting_confirmation' });

  p.actions.openPage('email_confirmation', { token, process });
} catch (error) {
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
