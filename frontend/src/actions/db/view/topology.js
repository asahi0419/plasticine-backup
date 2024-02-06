import { merge } from 'lodash/object';

import PlasticineApi from '../../../api';
import { processError } from '../../helpers';

export default async (model, view, metadata, viewOptions) => {
  const options = { ...viewOptions, humanize: true };
  const data = await getAppearanceWithTopologyDataRecords(model.alias, viewOptions, view);

  merge(options, data);

  return {
    payload: { metadata, db: {} },
    options,
    modelAlias: model.alias,
  };
};

const getAppearanceWithTopologyDataRecords = async (modelAlias, viewOptions, view) => {
  const appearance_id = view.appearance;
  if (!appearance_id) return [];

  const { exec_by: exec_by_original } = viewOptions;
  const exec_by = { ...exec_by_original, name: view.name };
  const options = { ...viewOptions, exec_by };

  const { data: { data: result } } = await PlasticineApi.executeAppearance(
    modelAlias, appearance_id, [], options);
  return result;
}
