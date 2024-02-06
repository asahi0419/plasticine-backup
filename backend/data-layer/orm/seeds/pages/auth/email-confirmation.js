export default {
  name: 'Email confirmation page',
  alias: 'email_confirmation',
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
    <Header as="h2" style={{ fontWeight: 'normal' }}>{p.translate('check_your_email', { defaultValue: 'Check your email' })}</Header>
  </div>
  <Form>
    <div className="inputs">
      <Form.Field>
        <Form.Input
          type="text"
          error={page.state.errors.securityCode}
          onChange={page.handleSecurityCodeChanged}
          label={(p.getRequest().process === 'password_recovery')
            ? p.translate('enter_password_recovery_code', { defaultValue: 'Enter the password recovery security code' })
            : p.translate('enter_registration_code', { defaultValue: 'Enter the registration security code' })}
        />
      </Form.Field>
      <div className="inputs-buttons">
        <div label="Resend code" style={{ color: '#4183c4', cursor: 'pointer' }} onClick={page.handleResendSecurityCode}>
          {p.translate('resend_code', { defaultValue: 'Resend code' })}
        </div>
        <Button basic onClick={page.handleSubmit}>
          {p.getRequest().process === 'password_recovery'
            ? p.translate('next_step', { defaultValue: 'Next step' })
            : p.translate('complete_registration_and_sign_in', { defaultValue: 'Complete registration and sign in' })}
        </Button>
      </div>
    </div>
  </Form>
</div>`,
  access_script: `p.currentUser.isGuest() && p.getSetting('authorization.allow_registration')`,
  component_script: `{
  initState: () => {
    if (p.getRequest().process === 'waiting_confirmation') {
      page.showWaitingConfirmationMessage();
    }
    return { securityCode: '', settings: page.getSettings(), errors: { securityCode: false }};
  },
  getSettings: () => ({
    allow_registration: false, ...p.getSetting('authorization'),
    project_name: p.getSetting('project_name'),
  }),
  showWaitingConfirmationMessage: () => {
    const header = p.translate('authentication_error', { defaultValue: 'Authentication error' });
    const content = p.translate('waiting_confirmation_error', { defaultValue: 'Your email is not confirmed yet' });
    p.showMessage({ type: 'negative', header, content });
  },
  handleSecurityCodeChanged: (_, { value: securityCode }) => page.setState({ securityCode }),
  isInputValid: () => {
    const { securityCode, errors } = page.state;
    const errorMessages = [];

    if (!securityCode) {
      errors.securityCode = true;
      errorMessages.push(p.translate('code_is_not_valid', { defaultValue: 'The entered code is not valid. Please check your email and try again' }));
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
  handleSubmit: () => page.isInputValid() && p.getAction('check_security_code')({ ...p.getRequest(), security_code: page.state.securityCode }),
  handleResendSecurityCode: () => p.getAction('resend_security_code')(p.getRequest()),
}`,
  actions: [
    {
      name: 'Check security code',
      alias: 'check_security_code',
      condition_script: 'true',
      server_script: `const request = p.getRequest();
const { token, security_code, process } = request;

try {
  const email = p.encryptor.decrypt(token);
  const account = await helpers.auth.findAccountByEmail(email);

  await account.validate('security_code', security_code, { ...request, ip_ban: { type: 'registration_security_code_protection' } });
  await account.update({ status: 'active' });

  await helpers.auth.authenticate(account);
} catch (error) {
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
    {
      name: 'Resend security code',
      alias: 'resend_security_code',
      condition_script: 'true',
      server_script: `const { token, process } = p.getRequest();

try {
  const email = p.encryptor.decrypt(token);
  const account = await helpers.auth.findAccountByEmail(email);
  const subject = (process === 'password_recovery') ? 'password recovery' : 'email confirmation';

  await account.sendSecurityCode(subject);
  p.actions.openPage('email_confirmation', { token, process });
} catch (error) {
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
