import { EMAIL_FORMAT } from './helpers.js';

export default {
  name: 'Login page',
  alias: 'login',
  server_script: '',
  component_script: `{
  initState: () => {
    const settings = p.getSetting('authorization');

    return {
      settings,
      values: {
        type: 'auth',
        email: '',
        password: '',
      },
      errors: {},
      isServiceFormOpened: !settings.service_account_button.enabled,
    };
  },

  getStrategies: () => {
    const { sso = {}, service_account_button: service = {} } = page.state.settings;
    const { strategies = {} } = sso;

    const result = [];
    lodash.each(strategies, (value, key) => {
      if (value.enabled) result.push({ ...value, strategy: key });
    });
    if (service.enabled && !page.state.isServiceFormOpened) result.push({ ...service, strategy: 'service' });

    if (result.length) return result;
  },

  isInputValid: () => {
    const { settings, errors } = page.state;

    const email = page.state.values.email.trim();
    const password = page.state.values.password;

    const result = [];

    if (!new RegExp(${EMAIL_FORMAT}).test(email)) {
      errors.email = true;
      result.push(p.translate('email_is_invalid', { defaultValue: 'Email is invalid' }));
    }

    if (password.length < settings.password.min_length) {
      errors.password = true;
      result.push(p.translate('min_password_length', { defaultValue: 'Minimum password length: {{value}}', value: settings.password.min_length }));
    }

    if (password.length > settings.password.max_length) {
      errors.password = true;
      result.push(p.translate('max_password_length', { defaultValue: 'Maximum password length: {{value}}', value: settings.password.max_length }));
    }

    if (result.length) {
      page.setState({ errors });

      p.showMessage({
        type: 'negative',
        header: p.translate('authentication_error', { defaultValue: 'Authentication error' }),
        list: result,
      });

      return false;
    }

    return true;
  },

  handleSubmit: async () => {
    if (page.isInputValid()) {
      const action = p.getAction('auth_user');
      await action(page.state.values, (data) => {
        if (data.type === 'otp') {
          localStorage.setItem('otp_token', data.token);

          if (data.activated) {
            return page.setState({ values: {
              ...page.state.values,
              type: data.type,
              otp_token: data.token,
            } });
          }

          history.push('/pages/setup_2fa');
        }
      });
    }
  },

  handleChange: (type) => (e, { value }) => {
    page.setState({ values: { ...page.state.values, [type]: value } });
  },

  renderHeaderContainer: () => {
    const type = page.state.values.type;

    let heading;
    if (type === 'auth') heading = p.translate('sign_in', { defaultValue: 'Sign In' });
    if (type === 'otp') heading = p.translate('page_2fa_setup_header', { defaultValue: '2-Factor Authentication' });

    return (
      <div className="header-container">
        <Header as="h1">{p.getSetting('project_name')}</Header>
        <Header as="h2" style={{ fontWeight: 'normal' }}>{heading}</Header>
      </div>
    );
  },

  renderContentContainer: () => {
    const type = page.state.values.type;

    if (type === 'auth') {
      return (
        <div className="content-container">
          {page.renderServiceForm()}
          {page.renderStrategiesButtons()}
          {page.renderRegisterLink()}
        </div>
      );
    }

    if (type === 'otp') {
      return (
        <div className="content-container">
          {page.rendeOtpCodeForm()}
        </div>
      );
    }

    return (
      <div className="content-container">
        Mode '{type}' is not supported
      </div>
    );
  },

  rendeOtpCodeForm: () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ margin: '20px 0'}}>
          {p.translate('page_login_code_text_1', { defaultValue: 'Please use an authentication code in the field below:' })}
        </div>

        <Form style={{ width: '65%', margin: '0 auto' }}>
          <div className="inputs">
            <Form.Field>
              <Form.Input
                type="number"
                error={page.state.errors['otp_code']}
                value={page.state.values['otp_code']}
                onChange={page.handleChange('otp_code')}
              />
            </Form.Field>
          </div>
          <div style={{ margin: '20px 0', width: 'calc(100% + 6px)'}}>
            {p.translate('page_login_code_text_2', { defaultValue: 'If you lost your device please contact your support group' })}
          </div>
  
          <Button basic onClick={page.handleSubmit}>
            {p.translate('auth_submit', { defaultValue: 'Submit' })}
          </Button>
        </Form>

      </div>
    );
  },

  renderServiceForm: () => {
    if (!page.state.isServiceFormOpened) return;

    return (
      <Form>
        <div className="inputs">
          <Form.Field>
            <Form.Input
              type="text"
              label={p.translate('email', { defaultValue: 'Email' })}
              error={page.state.errors.email}
              value={page.state.values.email}
              onChange={page.handleChange('email')}
            />
          </Form.Field>
          <Form.Field>
            <Form.Input
              type="password"
              label={p.translate('password', { defaultValue: 'Password' })}
              error={page.state.errors.password}
              value={page.state.values.password}
              onChange={page.handleChange('password')}
            />
            {page.renderChangePasswordLink()}
          </Form.Field>
        </div>
        <div className="inputs-buttons">
          <Button basic onClick={page.handleSubmit}>{p.translate('auth_submit', { defaultValue: 'Submit' })}</Button>
        </div>
      </Form>
    );
  },
  renderChangePasswordLink: () => {
    if (!page.state.settings.password.recovery) return;

    return (
      <Link to="/pages/password_recovery" style={{ position: 'absolute', top: 0, right: 0 }}>
        {p.translate('forgot_your_password', { defaultValue: 'Forgot your password?' })}
      </Link>
    );
  },
  renderStrategiesButtons: () => {
    const strategies = page.getStrategies();
    if (!strategies) return;

    return (
      <div className="strategies">
        <Divider />
        <div>
          {lodash.map(strategies, ({ name, icon, strategy }, key) => {
            if ((strategy === 'service') && page.state.isServiceFormOpened) return;

            const onClick = () => (strategy === 'service')
              ? page.setState({ isServiceFormOpened: true })
              : window.location.href = \`${process.env.ROOT_ENDPOINT}/__command/login/request/\${strategy}\`;

            return (
              <Button key={key} basic className="strategies-button" onClick={onClick}>
                <Icon name={icon} /> {name}
              </Button>
            );
          })}
        </div>
      </div>
    );
  },
  renderRegisterLink: () => {
    if (!page.state.settings.allow_registration) return;

    return (
      <div>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
          <div style={{ fontSize: '1.1em' }}>
            <Link to="/pages/create_account">{p.translate('create_account', { defaultValue: 'Create account' })}</Link> {p.translate('if_new_user', { defaultValue: 'if new user' })}
          </div>
        </div>
      </div>
    );
  },
}`,
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

.button.basic.strategies-button {
  position: relative;
  display: block;
  width: 100%;
  padding: 15px !important;
  margin-bottom: 14px;
  border-radius: 4px;
  color: {buttonBasicHover} !important;
  background-color: {buttonBasicBackgroundHover} !important;
  cursor: pointer;
  font-size: 18px;
  text-align: center;
  background: transparent !important;

  &:hover {
    color: {buttonBasic} !important;
    background-color: {buttonBasicBackground} !important;
  }

  i {
    position: absolute;
    top: 0;
    left: 15px;
    font-size: 28px;
    line-height: 48px;
    height: 48px;
  }
}

input[type='number'] {
  text-align: center;
}

input[type='number'] {
  -moz-appearance:textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
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
  {page.renderHeaderContainer()}
  {page.renderContentContainer()}
</div>`,
  access_script: 'p.currentUser.isGuest()',
  actions: [
    {
      name: 'Auth user',
      alias: 'auth_user',
      condition_script: 'true',
      server_script: `const request = p.getRequest();
const account = p.currentUser.getAccount();

try {
  if (request.otp_token) {
    await account.validate('otp_token', request.otp_token);
    await account.validate('otp_code', request.otp_code);
    await account.ensure('two_fa_activated');

    return helpers.auth.authenticate(account);
  }

  const authUser = await p.authUser(request.email, request.password);
  const authAccount = authUser.getAccount();

  if (request.client === 'mobile') {
    await helpers.auth.checkMcDevice(request, authUser.user)
  }

  if (await authAccount.getLoginType() === 'otp') {
    await authAccount.ensure('two_fa_code');

    return p.response.json({
      type: 'otp',
      token: await authAccount.createOtpToken(),
      activated: authAccount.getValue('two_fa_activated'),
    });
  }

  if (authAccount.getValue('status') === 'waiting_confirmation') {
    return p.actions.openPage('email_confirmation', {
      token: p.encryptor.encrypt(request.email),
      process: 'waiting_confirmation',
    });
  }

  helpers.auth.authenticate(authAccount, request);
} catch (error) {
  p.log.error(error);
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
