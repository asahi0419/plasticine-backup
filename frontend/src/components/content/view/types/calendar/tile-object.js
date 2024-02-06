import lodash from 'lodash';

import CellObject from './cell-object';

export default class TileObject {
  constructor(attributes) {
    this.attributes = attributes;
  }

  getRecord() {
    const item = this.attributes.item;
    return item ? item.record : null;
  }

  getNewCells() {
    if (lodash.isEmpty(this.attributes.newCells)) {
      return undefined;
    }

    return lodash.map(this.attributes.newCells, cell => {
      return new CellObject({
        startDate: cell.startDate,
        endDate: cell.endDate,
        group: this.attributes.newGroup
      });
    });
  }
}