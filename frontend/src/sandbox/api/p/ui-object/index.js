import { omit } from 'lodash/object';

import BaseObject from './base';
import ViewObject from './view';
import FormObject from './form';
import CardObject from './card';
import FeatureObject from './feature';
import ComponentObject from './component';
import PageObject from './page';
import TopologyObject from './topology';
import CalendarObjectUI from './calendar';

const Types = {
  base: BaseObject,
  form: FormObject,
  view: ViewObject,
  card: CardObject,
  feature: FeatureObject,
  component: ComponentObject,
  page: PageObject,
  topology: TopologyObject,
  calendar: CalendarObjectUI,
};

export default (input = {}) => {
  const { attributes = {}, options = {}, api, parent } = input;
  const { __type: type = 'base' } = attributes;

  const result = new Types[type](omit(attributes, ['__type']), options, parent);
  if (api) result.api = api;

  return result;
};

