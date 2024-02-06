export const POSSIBLE_UNITS = [
  'years', 'quarters', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds',
  'y', 'Q', 'M', 'w', 'd', 'h', 'm', 's', 'm',
];

export const OFFSET_REGEXP = `([+-]?)(\\d+)(${POSSIBLE_UNITS.join('|')})?`;

export const MS_BY_UNIT = {
  seconds: 1000,
  minutes: 1000 * 60,
  days:    1000 * 60 * 60 * 24,
  months:  1000 * 60 * 60 * 24 * 30,
  years:   1000 * 60 * 60 * 24 * 30 * 12,
};

export const TIMEOUT_COUNTER_LIMIT = 5;
