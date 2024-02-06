import getDraw from './draw/index.js'
import getGeoMetadata from './geo-metadata/index.js'

export default async (properties, appearance = {}, params, sandbox) => {
  const { options = {} } = appearance;

  const result = {};

  if (options['data-enrichment'].enable) {
    result['draw'] = await getDraw(properties, appearance, params);
  }
  if (options['draw'].enable) {
    result['draw-enable'] = true;
  }
  if (appearance['geo_metadata'].length) {
    result['geo_metadata'] = await getGeoMetadata(appearance['geo_metadata'], sandbox);
  }

  return result;
}