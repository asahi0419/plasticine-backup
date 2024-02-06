import moment from 'moment';
import { each } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { isFieldAlias } from './helpers.js';
import { OFFSET_REGEXP, MS_BY_UNIT } from './constants.js';
import { wrapError, WrongTimeOffsetError, EscalationCalculationTimeError } from '../../../../error/index.js';

export const calculateRuleScheduleTime = async (record, rule) => {
  const field = db.getField({ id: rule.target_field });
  const time = +record[field.alias];

  if (!rule.offset) {
    if (time) {
      return new Date(time);
    } else {
      return;
    }
  }

  const offset = isFieldAlias(rule.offset) ? record[rule.offset] : rule.offset;
  if (!offset) return;

  try {
    return calculateTimeWithOffset(time, offset);
  } catch (error) {
    throw wrapError(EscalationCalculationTimeError, { mode: 'start_time', offset })(error);
  }
};

export const calculateTaskScheduleTime = (task) => {
  const { reenable_type, reenable_every, start_at } = task;
  if ((reenable_type === 'no_reenable') || !reenable_every) return;

  const now = +new Date();
  const start = +start_at;

  if (start > now) return new Date(start);

  const shift = reenable_every * MS_BY_UNIT[reenable_type];
  const counter = Math.trunc((now - start) / shift);

  return new Date(start + (shift * counter) + shift)
};

export const calculateRuleReEnableTime = async (rule, task) => {
  let offset = rule.re_enable_after;

  if (isFieldAlias(offset)) {
    const record = await db.model(task.model).where({ id: task.record }).select([offset]).getOne();
    offset = record[offset];
  }

  if (!offset || (offset === '0')) return;

  try {
    return calculateTimeWithOffset(task.scheduled_on, offset);
  } catch (error) {
    throw wrapError(EscalationCalculationTimeError, { mode: 're_enable_time', offset })(error);
  }
};

export const calculateTimeWithOffset = (baseTime, offset) => {
  let time = moment(baseTime);

  const offsets = offset.match(new RegExp(OFFSET_REGEXP, 'g'));
  if (!offsets) throw new WrongTimeOffsetError(`Offset "${offset}" is not valid`);

  each(offsets, (o) => {
    const [_, op, number, unit] = o.match(new RegExp(OFFSET_REGEXP, 'i'));
    const operation = op === '-' ? 'subtract' : 'add';
    time = time[operation](number, unit || 's');
  });

  if (!time.isValid()) return;
  if (time.valueOf() < Date.now()) return new Date();

  return time.toDate();
};
