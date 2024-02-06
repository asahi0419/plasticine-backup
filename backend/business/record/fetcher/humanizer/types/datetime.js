import getValueHumanizer from '../../../humanizer/index.js';
import { spreadHumanizedAttribute } from '../helpers.js';

export default (field, sandbox) => {
  return (records) => spreadHumanizedAttribute(field, records, getValueHumanizer(field, sandbox));
};
