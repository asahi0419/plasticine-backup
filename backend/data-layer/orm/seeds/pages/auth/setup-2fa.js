export default {
  name: 'Two Factor Authentication (2FA) Setup',
  alias: 'setup_2fa',
  server_script: `try {
  const account = p.currentUser.getAccount();

  const activated = account.getValue('two_fa_activated');
  if (activated) return p.response.json({});

  const secret = account.getValue('two_fa_code');
  const email = account.getValue('email');

  const host = utils.getHostName();
  const qrBuffer = await p.utils.generateQRCode(\`otpauth://totp/\${host}:\${email}?secret=\${secret}&issuer=\${host}\`);
  const qr = \`data:image/jpeg;charset=utf-8;base64,\${qrBuffer.toString('base64')}\`

  p.response.json({ secret, qr });
} catch (error) {
  p.log.error(error)
  p.response.json({ error });
}`,
  component_script: `{
  initState: () => {
    return {
      values: {},
      errors: {},
    };
  },
  isInputValid: () => {
    const { values, errors } = page.state;
    const errorMessages = [];

    if (!values.code) {
      errors.code = true;
      errorMessages.push(p.translate('entered_code_is_not_valid', { defaultValue: 'The entered code is not valid' }));
    }

    if (errorMessages.length) {
      page.setState({ errors });

      p.showMessage({
        type: 'negative',
        header: 'WrongUserCredentialsError',
        content: errorMessages.join(' '),
      });

      return false;
    }

    return true;
  },
  handleCopyCode: () => {
    p.actions.copyToClipboard(p.getVariable('secret'), { message: 'Copied to clipboard' });
  },
  handleSubmit: async () => {
    if (page.isInputValid()) {
      try {
        await PlasticineApi.authUser({
          otp_token: localStorage.getItem('otp_token'),
          otp_code: page.state.values.code,
        });
      } catch (data) {
        const [ error ] = data.response.data.errors || [];
        if(error.name === 'TokenExpiredError' || error.name === 'WrongUserCredentialsError'){
          localStorage.removeItem('otp_token');
          history.push('/pages/login');
        }
        p.showMessage({
          type: 'negative',
          header: error.message,
          content: error.description,
        });
      }
    }
  },
  handleChange: (type) => (e, { value }) => {
    page.setState({ values: { ...page.state.values, [type]: value } });
  },
  renderSubmitButton: () => {
    return (
      <Button basic onClick={page.handleSubmit}>
        {p.translate('submit', { defaultValue: 'Submit' })}
      </Button>
    )
  },
  renderQRCodeContainer: () => {
    return (
      <div className="qr-code-container">
        <div className="header">
          {p.translate('page_2fa_setup_text_1', { defaultValue: 'Please use an authenticator app like 1Password, Authy, Microsoft Authenticator, or Google Authenticator to scan QR Code' })}
        </div>

        <div className="image">
          <img src={p.getVariable('qr')} />
        </div>
      </div>
    );
  },
  renderSecretInput: () => {
    return (
      <div className="input-wrapper secret">
        <div className="label">
          {p.translate('page_2fa_setup_text_2', { defaultValue: 'Or manually enter the code by copying the text below:' })}
        </div>
        <div className="input-control">
          <Form.Input
            type="text"
            readOnly={true}
            value={p.getVariable('secret')}
          />
          <Icon name="copy outline" onClick={page.handleCopyCode} />
        </div>
      </div>
    );
  },
  renderCodeInput: () => {
    return (
      <div className="input-wrapper code">
        <div className="label">
          {p.translate('page_2fa_setup_text_3', { defaultValue: 'Once you have connected your app, enter verification code in the field below (recent 6 digit):' })}
        </div>
        <div className="input-control">
          <Form.Input
            type="text"
            error={page.state.errors.code}
            value={page.state.values.code}
            onChange={page.handleChange('code')}
          />
        </div>
      </div>
    );
  },
  renderHeaderContainer: () => {
    return (
      <div className="header-container">
        <Header as="h2" style={{ fontWeight: 'normal' }}>
          {p.translate('page_2fa_setup_header', { defaultValue: '2-Factor Authentication' })}
        </Header>
      </div>
    );
  },
  renderContentContainer: () => {
    const error = p.getVariable('error');

    if (error) {
      return (
        <Message negative>
          <Message.Header>{error.name}</Message.Header>
          <p>{error.description}</p>
        </Message>
      );
    }

    return (
      <div className="content-container">
        {page.renderQRCodeContainer()}
        {page.renderSecretInput()}
        <Form>
          {page.renderCodeInput()}
          {page.renderSubmitButton()}
        </Form>
      </div>
    );
  },
}`,
  template: `<div className="container">
  {page.renderHeaderContainer()}
  {page.renderContentContainer()}
</div>`,
  styles: `padding: 20px;

.container {
  width: 520px;
  padding-top: 100px;
  margin: 0 auto;
  vertical-align: middle;
  text-align: center;
}

.header-container, .qr-code-container, .header, .input-wrapper .label {
  margin-bottom: 10px;
}

.header-container, .qr-code-container, .header, .input-wrapper .input-control {
  margin-bottom: 15px;
}

.header-container .header {
  color: {headerBackground} !important;
}

.qr-code-container .header {
  font-size: 16px;
}

.qr-code-container .image {
  width: 250px;
  height: 250px;
  display: inline-block;

  img {
    width: 100%;
  }
}

.input-wrapper {
  &.secret {
    width: 80%;
    margin: 0 auto;
  }

  &.code {
    width: 60%;
    margin: 0 auto;
  }

  .input-control, .field, .input, input {
    width: 100%;
    text-align: center;
  }
}

.input-wrapper .input-control {
  display: flex;
  justify-content: center;
  align-items: baseline;

  .icon {
    position: relative;
    top: 1px;
    left: 3px;
    margin-right: -16px;
    font-size: 18px;
    cursor: pointer;
  }
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
  access_script: `!p.currentUser.isGuest() && !p.currentUser.getAccount().getValue('two_fa_activated')`,
  __lock: ['delete'],
  actions: [],
};
