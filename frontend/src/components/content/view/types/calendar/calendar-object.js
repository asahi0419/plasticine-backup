import TileObject from './tile-object';

export default class CalendarObject {
  constructor(meta, updateFunction) {
    this.meta = meta;
    this.updateFunction = updateFunction;
  }

  getMeta() {
    return this.meta;
  }

  getTile(tileRawRecord) {
    return new TileObject(tileRawRecord);
  }

  update(tilesArray) {
    this.updateFunction(tilesArray);
  }
}