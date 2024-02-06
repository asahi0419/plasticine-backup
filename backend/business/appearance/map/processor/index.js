import getFeatures from './features/index.js';
import getGroups from './groups/index.js';
import getProperties from './properties/index.js';
import getSections from './sections/index.js';

export default async (data, properties, appearance, params, sandbox) => {
  return {
    type: 'FeatureCollection',
    features: getFeatures(data, properties),
    sections: getSections(data, properties, appearance, params),
    groups: getGroups(data, properties, appearance, params),
    properties: await getProperties(properties, appearance, params, sandbox),
  };
}
