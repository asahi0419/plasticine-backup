import PlasticineApi from '../../api';

export default async (page, params = {}) => {
  if (!page.server_script) return

  const result = await PlasticineApi.executeRecordScript('page', page.id, 'server_script', params);
  return result.data;
};
