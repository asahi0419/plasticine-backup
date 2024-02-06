import lodash from 'lodash-es';

import * as Type from './type/index.js';

export default (data, properties) => {
  return lodash.map(data, (item = {}) => {
    const { feature = {}, records } = item;
    const { geometry } = feature;

    let mode;
    if (records && geometry) mode = 'dynamic';
    if (records && !geometry) mode = 'blank';
    if (!records && geometry) mode = 'static';


    if (mode === 'blank') {
      item.feature = { ...item.feature, ...Type.Blank(item.records) };
    }

    return Type[item.feature.geometry.type](mode, item, { properties });
  });
}