import * as CONSTANTS from '../../../../../constants';

export default class CellObject {
  constructor(attributes) {
    this.attributes = attributes;
  }

  getResource() {
    return this.attributes.group;
  }

  getStart() {
    return this.attributes.startDate.format(CONSTANTS.ISO_DATE_FORMAT);
  }

  getEnd() {
    return this.attributes.endDate.format(CONSTANTS.ISO_DATE_FORMAT);
  }
}