import { omit } from 'lodash/object';

import Base from './base';

export default class FeatureObject extends Base {
  __type = 'feature';

  getType() {
    return this.attributes.geometry.type;
  }

  getTarget() {
    return omit(this.attributes, ['__type']);
  }

  getEventCoordinates() {
    return this.attributes.event.coordinates;
  }
}
