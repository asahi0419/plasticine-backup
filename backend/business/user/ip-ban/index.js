import moment from 'moment';
import { filter } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import ModelProxy from '../../sandbox/api/model/index.js';
import { getSetting } from '../../setting/index.js';
import { wrapRecord } from '../../sandbox/api/model/index.js';
import { WrongUserCredentialsError } from '../../error/index.js';

import * as HELPERS from './helpers.js';
import { DEFAULT_DATE_FORMAT } from '../../constants/index.js';
import { REASONS, OPERATIONS, ERRORS, FLAGS } from './constants.js';

export default class IpBan {
  constructor(request = {}, sandbox, settings) {
    const { __headers = {}, __meta = {} } = request;
    const ip = __headers['x-real-ip'] || __meta.ip;

    if (ip) {
      this.ip = ip;

      this.request = request;
      this.sandbox = sandbox;

      this.settings = HELPERS.normalizeSettings(settings || getSetting('authorization.brute_protect'));
    }
  }

  async setOptions(account, now) {
    this.options = this.settings.account.ban && account
      ? this.settings.account
      : this.settings.ip;

    if (this.settings.account.ban && this.settings.ip.ban && account) {
      const bans = await db.model('ip_ban').where({ ip: this.ip, __inserted: true });

      const acs = filter(bans, (b) => b.account !== account.id && moment(b.ban_till).isAfter(now));
      if (acs.length) this.options = this.settings.ip;
    }
  }

  async process(command, type, operation, account, now = moment()) {
    if (!this.ip) return;

    await this.setOptions(account, now);

    if (command === 'create') {
      return this.options.ban
        ? await this.create(type, operation, account, now)
        : await this.errors(type, operation, account, now);
    }

    if (command === 'validate') {
      return this.options.ban
        ? await this.validate(type, operation, account, now)
        : null;
    }
  }

  async create(type, operation, account, now = moment()) {
    await this.setBan(type, account, now);
    await this.setOperation(operation);
    await this.setAttempts(now);
    await this.setBanLevel(now);
    await this.setBanTill(now);
    await this.setReason(type);

    await this.finalize();
    await this.errors(type, operation, now);

    return this.instance;
  }

  async delete() {
    await this.instance.delete();
  }

  async finalize() {
    await this.instance.assignAttributes({ updated_at: new Date() }).save();
  }

  async validate(type, operation, account, now = moment()) {
    const attributes = HELPERS.getAttributes(this, type, account);
    const record = await db.model('ip_ban').where({ ...attributes, __inserted: true }).getOne();

    if (!record) return;
    if (!record.ban_till || moment(record.ban_till).isBefore(now)) return;

    return this.create(type, operation, account, now);
  }

  async setBan(type, account, now) {
    const model = (await this.sandbox.vm.p.getModel('ip_ban')).setOptions({ check_permission: { all: false } });
    const attributes = HELPERS.getAttributes(this, type, account);

    this.instance = await model.findOne(attributes)
      || await model.insert({ ip: this.ip, ...attributes, attempts: 0, ban_level: '0' });
  }

  async setOperation(operation) {
    this.operation = this.getOperation(operation);
  }

  getOperation(operation) {
    const params = {}

    if (operation === 'security_code') {
      params.type = this.sandbox.translate('static.security_code', { defaultValue: 'security code' });
      params.description = this.sandbox.translate('static.please_check_your_email_and_try_again', { defaultValue: 'Please check your email and try again' });
    }

    if (operation === 'otp_code') params.type = this.sandbox.translate('static.otp_code', { defaultValue: 'OTP code' })

    return params.description ? `${this.sandbox.translate(OPERATIONS[operation], params)}. ${params.description}` : `${this.sandbox.translate(OPERATIONS[operation], params)}`;
  }

  async setAttempts(now) {
    const ban_till = this.instance.getValue('ban_till');
    if (ban_till && moment(ban_till).isAfter(now)) return;

    const attempts = this.instance.getValue('attempts');
    this.instance.setValue('attempts', attempts + 1);
  }

  async setBanLevel(now) {
    if (!this.options.by_levels) return;

    const attempts = this.instance.getValue('attempts');
    if (attempts !== this.options.attempts) return;

    let ban_level = `${+this.instance.getValue('ban_level') + 1}`;
    if (ban_level == 6) ban_level = '5';

    this.instance.setValue('ban_level', ban_level);
  }

  async setBanTill(now) {
    const attempts = this.instance.getValue('attempts');
    if (attempts !== this.options.attempts) return;

    let minutes = this.options.duration;

    if (this.options.by_levels) {
      const ban_level = this.instance.getValue('ban_level');
      const field = this.instance.getField('ban_level');
      const options = field.getOptions();

      minutes = parseInt(options.values[ban_level]);
    }

    this.instance.setValue('ban_till', moment(now).add(minutes, 'minutes'));
    this.instance.setValue('attempts', 0);
  }

  async setReason(type) {
    let reason = this.instance.getValue('reason');
    if (!reason) this.instance.setValue('reason', this.getReason(type));
  }

  getReason(type) {
    return this.sandbox.translate(REASONS[type]);
  }

  async errors(type, operation, now) {
    if (process.env.NODE_ENV === 'test') return;
    if (!this.options.ban) throw new WrongUserCredentialsError(this.getOperation(operation));

    const ban_till = this.instance.getValue('ban_till');
    const ban_level_curr = +this.instance.getValue('ban_level');
    const ban_level_prev = +this.instance.getPrevValue('ban_level');

    const field = this.instance.getField('ban_level');
    const options = field.getOptions();

    if (ban_till && moment(ban_till).isAfter(now) && (ban_level_curr !== ban_level_prev)) {
      const minutes = this.options.by_levels ? parseInt(options.values[ban_level_curr]) : this.options.duration;
      const till = moment(moment().utcOffset(this.sandbox.timeZoneOffset)).add(minutes, 'minutes').format(DEFAULT_DATE_FORMAT);
      const message = this.sandbox.translate(`static.wrong_credentials_is_ban_${this.options.ban_type}`, { operation: this.operation, minutes, till });

      throw new ERRORS[this.options.ban_type](message);
    }

    if (ban_till && moment(ban_till).isAfter(now)) {
      const reason = this.instance.getValue('reason');
      const minutes = this.options.by_levels ? parseInt(options.values[ban_level_curr]) : this.options.duration;
      const till = moment(ban_till).utcOffset(this.sandbox.timeZoneOffset).format(DEFAULT_DATE_FORMAT);
      const message = this.sandbox.translate(`static.user_status_banned_error_reason_${this.options.ban_type}`, { reason, minutes, till });

      throw new ERRORS[this.options.ban_type](message);
    }

    const attempts = this.options.attempts - this.instance.getValue('attempts');
    const minutes = this.options.by_levels ? parseInt(options.values[((ban_level_curr + 1) === 6) ? 5 : (ban_level_curr + 1)]) : this.options.duration;
    const till = moment(moment().utcOffset(this.sandbox.timeZoneOffset)).add(minutes, 'minutes').format(DEFAULT_DATE_FORMAT);
    const message = this.sandbox.translate(`static.wrong_credentials_will_ban_${this.options.ban_type}`, { operation: this.operation, attempts, minutes, till });

    throw new WrongUserCredentialsError(message);
  }

  async clear(account) {
    return db.model('ip_ban')
      .where({ ban_type: 'ip', ip: this.ip })
      .orWhere({ ban_type: 'account', account: account.id, ip: this.ip })
      .delete();
  }
}
