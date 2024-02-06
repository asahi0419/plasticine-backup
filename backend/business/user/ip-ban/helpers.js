import { isBoolean, isNumber } from 'lodash-es';

export const normalizeSettings = (options = {}) => {
  const { account = {}, ip = {} } = options;

  const result = {
    account: {
      ban: isBoolean(account.ban) ? account.ban : false,
      attempts: isNumber(account.attempts) ? account.attempts : 5,
      duration: isNumber(account.duration) ? account.duration : 60,
      by_levels: isBoolean(account.by_levels) ? account.by_levels : false,
      ban_type: 'account',
    },
    ip: {
      ban: isBoolean(ip.ban) ? ip.ban : true,
      attempts: isNumber(ip.attempts) ? ip.attempts : 3,
      duration: isNumber(ip.duration) ? ip.duration : 60,
      by_levels: isBoolean(ip.by_levels) ? ip.by_levels : true,
      ban_type: 'ip',
    },
  };

  if (!result.account.attempts) result.account.ban = false;
  if (!result.ip.attempts) result.ip.ban = false;

  return result;
};

export const getAttributes = (context, type, account) => {
  const result = { type, ban_type: context.options.ban_type, ip: context.ip };

  if (context.options.ban_type === 'account') result.account = account.id;

  return result;
};
