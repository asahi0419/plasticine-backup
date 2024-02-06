import lodash from 'lodash-es';

import * as Constants from '../../constants.js';

export default (data, properties = {}, appearance = {}, params = {}) => {
  const { options = {} } = appearance;
  const { draw = {} } = options;

  const initial = [];

  if (draw.enable) {
    initial.push(Constants.FREE_OBJECTS_SECTION)
    initial.push(Constants.ASSOCIATED_OBJECTS_SECTION)
  }

  return data.reduce((result, item = {}) => {
    const metadata = item.metadata['section'];

    if (metadata.id === 'default') metadata.name = (params.exec_by || {}).name;
    if (lodash.find(result, { id: metadata.id })) return result;

    result.push(metadata);

    return result;
  }, initial);
}
