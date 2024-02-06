import lodash from 'lodash-es';

import * as Constants from '../../constants.js';

export default (data, properties = {}, appearance = {}) => {
  const { options = {} } = appearance;
  const { draw = {} } = options;

  const initial = [];

  if (draw.enable) {
    const point = { ...Constants.FREE_POINTS_GROUP };
    if (properties.Point['other'].properties['marker-symbol']) point['icon'] = properties.Point['other'].properties['marker-symbol'];
    if (properties.Point['other'].properties['marker-color']) point['icon-color'] = properties.Point['other'].properties['marker-color'];
    if (properties.Point['free'].properties['marker-symbol']) point['icon'] = properties.Point['free'].properties['marker-symbol'];
    if (properties.Point['free'].properties['marker-color']) point['icon-color'] = properties.Point['free'].properties['marker-color'];

    const lineString = { ...Constants.FREE_LINES_GROUP };
    if (properties.LineString['other'].properties['marker-symbol']) lineString['icon'] = properties.LineString['other'].properties['marker-symbol'];
    if (properties.LineString['other'].properties['stroke']) lineString['icon-color'] = properties.LineString['other'].properties['stroke'];
    if (properties.LineString['free'].properties['marker-symbol']) lineString['icon'] = properties.LineString['free'].properties['marker-symbol'];
    if (properties.LineString['free'].properties['stroke']) lineString['icon-color'] = properties.LineString['free'].properties['stroke'];

    const polygon = { ...Constants.FREE_POLYGONS_GROUP };
    if (properties.Polygon['other'].properties['marker-symbol']) polygon['icon'] = properties.Polygon['other'].properties['marker-symbol'];
    if (properties.Polygon['other'].properties['stroke']) polygon['icon-color'] = properties.Polygon['other'].properties['stroke'];
    if (properties.Polygon['free'].properties['marker-symbol']) polygon['icon'] = properties.Polygon['free'].properties['marker-symbol'];
    if (properties.Polygon['free'].properties['stroke']) polygon['icon-color'] = properties.Polygon['free'].properties['stroke'];

    initial.push(point);
    initial.push(lineString);
    initial.push(polygon);
  }

  return data.reduce((result, item = {}) => {
    const metadata = item.metadata['group'];

    if (metadata.id === 'default') return result;
    if (lodash.find(result, { id: metadata.id, section: metadata.section })) return result;

    result.push(metadata);

    return result;
  }, initial);
};
