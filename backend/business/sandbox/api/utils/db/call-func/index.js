import { each, isString, isUndefined, isArray } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (funcName, args) => {
  if (!isString(funcName)) throw new ParamsNotValidError("Parameter 'funcName' in callFunc(...) must be a string");

  let string = `SELECT * FROM ${funcName}(`

  if (!isUndefined(args)) {
    if (!isArray(args)) throw new ParamsNotValidError("Parameter 'args' in callFunc(...) must be an array");

    each(args, (arg, index) => {
      string += isString(arg) ? `'${arg}'` : arg;
      string += (index === (args.length - 1)) ? '' : ', ';
    });
  }

  string += ')';

  return db.client.raw(string);
}
