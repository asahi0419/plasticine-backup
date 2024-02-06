import { createRequire } from 'module';
const Require = createRequire(import.meta.url);

import jwt from 'jsonwebtoken';
import moment from 'moment';

import db from '../../../../../data-layer/orm/index.js';
import IpBan from '../../../../user/ip-ban/index.js';
import ModelProxy from '../../model/index.js';
import encryptPassword from '../../../../user/helpers/encrypt-password/index.js';
import sendMailFunction from '../send-mail/index.js';
import { wrapRecord } from '../../../../sandbox/api/model/index.js';
import { getSetting } from '../../../../setting/index.js';
import {
  WrongUserCredentialsError,
  TokenExpiredError,
  OtpCodeIsNotValidError,
} from '../../../../error/index.js';
import { parseOptions } from '../../../../helpers/index.js';
import { generateToken, generateSecurityCode } from '../../../../user/index.js';
import {
  createSession,
  closeAllActiveSessions,
  closeSession,
} from '../../../../user/session.js';
import { has } from 'lodash-es';
import redis from '../../redis.js';

const twofactor = Require('node-2fa');

export default class AccountProxy {
  constructor(user, sandbox) {
    this.user = user;
    this.sandbox = sandbox;
    this.otpTokenKey = `otp_token_${this.getValue('id')}`;
  }

  async update(attributes) {
    if (has(attributes, 'password')) {
      const { salt, password: currentPasswordEncrypted } = this.user.account;
      const newPasswordEncrypted = await encryptPassword(
        attributes.password,
        salt
      );
      if (currentPasswordEncrypted === newPasswordEncrypted)
        throw new WrongUserCredentialsError(
          this.sandbox.translate('static.password_used_recently')
        );
    }

    this.user.account = await db
      .model('account', this.sandbox)
      .updateRecord(this.user.account, attributes, false);

    return this;
  }

  getValue(fieldAlias) {
    return this.user.account[fieldAlias];
  }

  async checkStatus() {
    if (this.user.account.type === 'service') return 'active';

    const passwordExpiredTime = getSetting(
      'authorization.password.expired_time'
    );
    const dateChange = moment(this.getLastPasswordChange());
    const dateExpired = dateChange.add(passwordExpiredTime, 'd').valueOf();
    const dateNow = moment().valueOf();

    if (passwordExpiredTime > 0 && dateExpired < dateNow) {
      await db
        .model('account')
        .where({ id: this.user.account.id })
        .update({ status: 'expired' });
      return 'expired';
    }

    return this.user.account.status;
  }

  async getLoginType() {
    const g2fa = getSetting('authorization.2fa');
    const a2fa = this.getValue('two_fa');

    return a2fa === 'app' || (a2fa === 'global' && g2fa === 'app')
      ? 'otp'
      : 'auth';
  }

  async isExpiredOtpToken(value) {
    if (value) {
      const secret = process.env.APP_SECRET_ALGORITHM
        ? process.env.APP_SECRET_PUBLIC
        : process.env.APP_SECRET;
      const decoded = jwt.verify(value, secret);
      const { exp } = decoded;

      return Date.now() > exp;
    }
    return true;
  }

  async createOtpToken() {
    const context = {
      secret: process.env.APP_SECRET,
      options: {},
    };
    if (process.env.APP_SECRET_ALGORITHM) {
      context.secret = process.env.APP_SECRET_PRIVATE;
      context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
    }

    const key = this.otpTokenKey;
    const fiveMinutes = 5 * 60 * 1000;

    const token = jwt.sign(
      {
        auth: 'otp',
        email: this.getValue('email'),
        exp: Date.now() + fiveMinutes,
      },
      context.secret,
      context.options
    );

    await this.sandbox.vm.p.cache.set(key, token, fiveMinutes);
    return token;
  }

  async getOtpToken() {
    const key = this.otpTokenKey;
    return await this.sandbox.vm.p.cache.get(key);
  }

  async getLogoutCallbackUrl() {
    const strategiesMap = {
      azure_token: 'azure',
      google_token: 'google',
      custom_token: 'custom',
      custom_saml2_token: 'custom_saml2',
    };
    const options = parseOptions(this.user.__session?.details);
    const params =
      getSetting(
        `authorization.sso.strategies.${
          strategiesMap[options.auth_type]
        }.params`
      ) || {};

    return params.logoutCallbackUrl || getSetting('start_url');
  }

  getLastPasswordChange() {
    return (
      this.user.account.last_password_change || this.user.account.created_at
    );
  }

  closeActiveSessions(options) {
    return closeAllActiveSessions(this.user, options, this.sandbox);
  }

  async closeCurrentSession(options) {
    if (!this.user.__session) return;
    options.redirect = await this.getLogoutCallbackUrl();
    return closeSession(this.user.__session, options, this.user, this.sandbox);
  }

  async createSession(request) {
    const model = db.getModel('session');
    const modelProxy = new ModelProxy(model, this.sandbox);
    const session = await createSession(this.user, request, this.sandbox, {
      logged_with: 'login',
    });

    return wrapRecord(modelProxy)(session);
  }

  async resetStaticToken() {
    const attributes = { static_token: generateToken() };

    this.user.account = await db
      .model('account', this.sandbox)
      .updateRecord(this.user.account, attributes, false);

    return this;
  }

  async resetSecurityCode() {
    const attributes = { security_code: generateSecurityCode() };

    this.user.account = await db
      .model('account', this.sandbox)
      .updateRecord(this.user.account, attributes, false);

    return this;
  }

  async sendSecurityCode(subject, token, gToken, permissions={}) {
    await this.resetSecurityCode();

    const sendMail = sendMailFunction(this.sandbox);
    const projectName = getSetting('project_name');
    const code = this.getValue('security_code');
    const tokenLink = token
      ? `Follow the link: ${this.sandbox.vm.utils.getHostURL()}/pages/setup_new_password?etoken=${token}&process=password_recovery&gToken=${gToken}`
      : '';

    const target_record = this.user.account;
    const to = this.getValue('email');
    const body = `Dear customer,

To verify your identity, please use the following code:
${code}

${tokenLink}
Link is valid for the next 10 minutes.

Best regards,
${projectName} team`;

    subject = `${projectName} ${subject}`;
    await sendMail({ body, content_type: 'text', to, target_record, subject }, [], permissions);

    await redis.set(`password_recovery_${gToken}`, `${to}|${code}`, 'EX', 600);
  }

  async validate(type, input, params = {}) {
    const ipBan = new IpBan(params, this.sandbox);
    let value = this.getValue(type);
    let result;

    if (type === 'security_code') result = value === input;

    if (type === 'otp_token') {
      value = await this.getOtpToken();
      result = value === input && !(await this.isExpiredOtpToken(value));

      if (!result)
        throw new TokenExpiredError(
          this.sandbox.translate('static.token_code_is_expired')
        );
      return result;
    }
    if (type === 'otp_code') {
      value = await this.getValue('two_fa_code');
      result = (twofactor.verifyToken(value, input) || {}).delta === 0;

      if (!result)
        throw new WrongUserCredentialsError(
          this.sandbox.translate('static.code_is_not_valid', { type })
        );
      return result;
    }

    if (params.ip_ban) {
      return result
        ? ipBan.process('validate', params.ip_ban.type, type)
        : ipBan.process('create', params.ip_ban.type, type);
    }

    if (result) {
      return result;
    }

    throw new WrongUserCredentialsError(
      this.sandbox.translate('static.code_is_not_valid', { type })
    );
  }

  async ensure(type) {
    if (type === 'two_fa_activated') {
      if (!this.getValue('two_fa_activated')) {
        await this.update({ two_fa_activated: true });
      }
    }

    if (type === 'two_fa_code') {
      if (!this.getValue('two_fa_code')) {
        await this.update({
          two_fa_code: twofactor.generateSecret({
            name: process.env.APP_HOST_NAME,
            account: this.getValue('email'),
          }).secret,
        });
      }
    }

    return this;
  }

  async changePassword(currentPassword, password) {
    const salt = this.getValue('salt');
    const currentPasswordEncrypted = this.getValue('password');
    const newPasswordEncrypted = encryptPassword(password, salt);

    if (currentPasswordEncrypted !== encryptPassword(currentPassword, salt))
      throw new WrongUserCredentialsError(
        this.sandbox.translate('static.current_password_is_not_valid')
      );
    if (currentPasswordEncrypted === newPasswordEncrypted)
      throw new WrongUserCredentialsError(
        this.sandbox.translate('static.password_used_recently')
      );

    this.user.account = await db
      .model('account', this.sandbox)
      .updateRecord(this.user.account, { password }, false);
  }
}
