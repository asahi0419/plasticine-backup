import lodash from 'lodash';

import PlasticineApi from '../../../api';

export default async (currentModel, view, metadata, viewOptions) => {
  const appearance = await getAppearance(currentModel.alias, view.appearance);

  const appearObj = appearance[0];

  const options = { ...viewOptions, humanize: true };

  lodash.merge(options, {
    appearance: { ...appearObj, currentModel, currentViewFilter: getCurrentViewFilter(metadata) },
  });

  return {
    payload: { metadata, db: {} },
    options,
    modelAlias: currentModel.alias,
  };
};

const getAppearance = async (modelAlias, appearanceId) => {
  if (!appearanceId) return [];
  const { data: { data: appearance } } = await PlasticineApi.executeAppearance(modelAlias, appearanceId);
  return appearance;
}

const getCurrentViewFilter = (metadata) => {
  if (lodash.isEmpty(metadata.filter)) {
    return null;
  }
  return Object.values(metadata.filter)[0].query;
}
