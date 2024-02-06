import pako from 'pako';

import * as CONFIGS from './configs';
import * as HELPERS from '../../../../helpers';
import PlasticineApi from '../../../../api';
import { fetchFilterTree } from '../../../helpers';
import { applyDefaultAutorefresh } from '../helpers';
import { getImportsData, importsMapper } from './helpers';

export default async (model, view, metadata = {}, viewOptions) => {
  const options = viewOptions;
  options.humanize = true;

  const appearance = { ...(metadata.appearance || {})[view.appearance] || {} };
  appearance.options = HELPERS.parseOptions(appearance.options);
  if (appearance.options['no-cache'] === true) {
    options.no_cache = true;
  }

  const filter = (metadata.filter || {})[view.filter];
  if (!options.filter && filter) {
    options.filter = filter.query;
  }

  applyDefaultAutorefresh(options);

  return {
    payload: { metadata, db: await getGeoJSON(model.alias, view, appearance, options) },
    options: { ...options, filterTree: await getFilterTree(model.alias, options.filter) },
    modelAlias: model.alias
  };
};

async function getGeoJSON(modelAlias, view, appearance = {}, options = {}) {
  const response = await PlasticineApi.executeMapAppearance(modelAlias, appearance.id, options);
  const data = options.no_cache ? response.data : JSON.parse(pako.inflate(response.data, { to: 'string' }));

  const kmzFeatures = await getImportsData(appearance.options, 'kmz', (progress) => PubSub.publish(`view-data-loading-progress-${view.id}`, progress));
  const zipFeatures = await getImportsData(appearance.options, 'zip', (progress) => PubSub.publish(`view-data-loading-progress-${view.id}`, progress));
  const geoFeatures = await getImportsData(appearance.options, 'geojson', (progress) => PubSub.publish(`view-data-loading-progress-${view.id}`, progress));

  if (kmzFeatures.length) {
    data.features = [ ...data.features, ...kmzFeatures ];
    data.sections.push({ ...CONFIGS.DEFAULT_SECTION, id: 'Import (kmz)', name: 'Import (kmz)' });
  }

  if (zipFeatures.length) {
    data.features = [ ...data.features, ...zipFeatures ];
    data.sections.push({ ...CONFIGS.DEFAULT_SECTION, id: 'Import (zip)', name: 'Import (zip)' });
  }

  if (geoFeatures.length) {
    data.features = [ ...data.features, ...geoFeatures ];
    data.sections.push({ ...CONFIGS.DEFAULT_SECTION, id: 'Import (geo)', name: 'Import (geo)' });
  }

  return data;
}

async function getFilterTree(modelAlias, filter) {
  const { data: { data } } = await fetchFilterTree(modelAlias, filter);

  return data;
}
