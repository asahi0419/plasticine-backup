import Base from './base';
import CalendarObject from '../../../../components/content/view/types/calendar/calendar-object';
import TileObject from '../../../../components/content/view/types/calendar/tile-object';
import CellObject from '../../../../components/content/view/types/calendar/cell-object';

export default class CalendarObjectUI extends Base {
  getCalendar() {
    return new CalendarObject(this.attributes.meta, this.attributes.updateFunction);
  }

  getTarget() {
    return this.attributes.objectType;
  }

  getAction() {
    return this.attributes.action;
  }

  getObject() {
    return this.attributes.objectType === 'cell' ? new CellObject(this.attributes) : new TileObject(this.attributes);
  }
}