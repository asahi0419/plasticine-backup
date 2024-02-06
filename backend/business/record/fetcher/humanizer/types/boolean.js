import getValueHumanizer from '../../../humanizer/index.js';
import { spreadHumanizedAttribute } from '../helpers.js';

export default (field, sandbox) => (records) =>
  spreadHumanizedAttribute(field, records, getValueHumanizer(field, sandbox));
