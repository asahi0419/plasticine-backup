import getValueHumanizer from '../../../humanizer/index.js';
import { spreadHumanizedAttribute } from '../helpers.js';

export default (field, sandbox) => {
  const valueHumanizer = getValueHumanizer(field, sandbox);
  return (records) => spreadHumanizedAttribute(field, records, valueHumanizer);
};
