import Flags from '../../record/flags.js';
import { AccountBannedError, IpBannedError } from '../../error/index.js';

export const REASONS = {
  login:                                      'static.user_status_banned_error_reason_authorization_attempts_limit',
  password_recovery_email_protection:         'static.user_status_banned_error_reason_email_check_attempts_limit',
  password_recovery_security_code_protection: 'static.user_status_banned_error_reason_security_code_attempts_limit',
  registration_security_code_protection:      'static.user_status_banned_error_reason_security_code_attempts_limit',
};

export const OPERATIONS = {
  security_code:               'static.code_is_not_valid',
  password:                    'static.password_is_not_valid',
  email_is_not_registered:     'static.email_is_not_registered',
  email_is_already_registered: 'static.email_is_already_registered',
};

export const ERRORS = {
  account: AccountBannedError,
  ip:      IpBannedError,
};

export const FLAGS = new Flags({ check_permission: false });
