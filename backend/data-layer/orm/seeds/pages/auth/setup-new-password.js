export default {
  name: 'Setup new password page',
  alias: 'setup_new_password',
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
  justify-content: space-between;
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
    <Header as="h2" style={{ fontWeight: 'normal' }}>{p.translate('check_your_email_and_setup_new_password', { defaultValue: 'Check your email and setup new password' })}</Header>
  </div>
  <Form>
    <div className="inputs">
      <Form.Field>
        <Form.Input
          type="text"
          error={page.state.errors.securityCode}
          onChange={page.handleSecurityCodeChanged}
          label={p.translate('enter_password_recovery_code', { defaultValue: 'Enter the password recovery security code' })}
        />
      </Form.Field>
      <Form.Field>
        <Form.Input
          type="password"
          error={page.state.errors.password}
          onChange={page.handleNewPasswordChanged}
          label={p.translate('new_password', { defaultValue: 'New password' })}
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
        <div label="Resend code" style={{ color: '#4183c4', cursor: 'pointer' }} onClick={page.handleResendSecurityCode}>
          {p.translate('resend_code', { defaultValue: 'Resend code' })}
        </div>
        <Button basic onClick={page.handleSubmit}>
          {p.translate('apply_new_password_and_sign_in', { defaultValue: 'Apply new password and sign in' })}
        </Button>
      </div>
    </div>
  </Form>
</div>`,
  access_script: `p.currentUser.isGuest() && p.getSetting('authorization.password.recovery')`,
  server_script: `const { etoken, gToken } = p.getRequest();
  
  const keyExists = await redis.exists('password_recovery_' + gToken);
  if (!keyExists) {
    return p.actions.openPage('login', { message: p.translate('static.the_entered_password_recovery_link_is_not_valid_anymore') });
  }

  p.response.json({ email: etoken ? p.encryptor.decrypt(etoken) : null });`,
  component_script: `{
  initState: () => ({
    email: p.getVariable('email'),
    securityCode: '',
    password: '',
    reEnteredPassword: '',
    settings: page.getSettings(),
    errors: { securityCode: false, password: false, reEnteredPassword: false },
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
    const { securityCode, password, reEnteredPassword, settings, errors } = page.state;
    const errorMessages = [];

    if (!securityCode) {
      errors.securityCode = true;
      errorMessages.push(p.translate('code_is_not_valid', { defaultValue: 'The entered code is not valid. Please check your email and try again' }));
    }

    if (!password || !reEnteredPassword) {
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
  handleSecurityCodeChanged: (_, { value: securityCode }) => page.setState({ securityCode }),
  handleNewPasswordChanged: (_, { value: password }) => page.setState({ password }),
  handleReEnterPasswordChanged: (_, { value: reEnteredPassword }) => page.setState({ reEnteredPassword }),
  handleResendSecurityCode: () => p.getAction('resend_security_code_new_password')(p.getRequest()),
  handleSubmit: () => page.isInputValid() && p.getAction('apply_new_password')({ security_code: page.state.securityCode, email: page.state.email, password: page.state.password }),
}`,
  actions: [
    {
      name: 'Apply new password',
      alias: 'apply_new_password',
      condition_script: 'true',
      server_script: `const request = p.getRequest();
const { email, password, security_code } = request;

try {
  const account = await helpers.auth.findAccountByEmail(email);
  await account.validate('security_code', security_code, { ...request, ip_ban: { type: 'password_recovery_security_code_protection' } });
  await account.update({ password });

  await helpers.auth.authenticate(account);
} catch (error) {
  p.response.error(error)
}`,
      __lock: ['delete'],
    },
    {
      name: 'Resend security code (Setup new password page)',
      alias: 'resend_security_code_new_password',
      condition_script: 'true',
      server_script: `let { token, process, gToken } = p.getRequest();

try {
  if (process === 'password_recovery') {
    const emailToken = await redis.get('password_recovery_' + gToken);
    if (!emailToken) {
      return p.actions.openPage('login', { message: p.translate('static.the_entered_password_recovery_link_is_not_valid_anymore') });
    }  
  
    const [ email ] = emailToken.split('|'); 
    const accountProxy = await helpers.auth.findAccountByEmail(email, { ip_ban: { type: 'password_recovery_email_protection' } });
  
    const notAllowedStatuses = ['banned', 'disabled', 'inactive', 'waiting_confirmation', '']; 
    if(notAllowedStatuses.includes(accountProxy.getValue('status'))){
       throw new Error('Your account status has been suspended. Please contact system administrator for further instructions');  
    }
    
    const etoken = p.encryptor.encrypt(email);
    gToken = p.encryptor.randomBytes();
    await accountProxy.sendSecurityCode('password recovery', etoken, gToken, { ignorePermissions: true });
    const process = 'password_recovery';
  
    return  p.actions.openPage('setup_new_password', { etoken, process, gToken });
  }
  
  const email = p.encryptor.decrypt(token);
  const account = await helpers.auth.findAccountByEmail(email);
  const subject = 'email confirmation';

  await account.sendSecurityCode(subject);
  p.actions.openPage('setup_new_password', { token, process });
} catch (error) {
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
