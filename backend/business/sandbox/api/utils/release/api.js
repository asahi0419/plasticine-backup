import axios from 'axios';

import logger from '../../../../logger/index.js';

export const findProject = async (params = {}) => {
  const url = `${params.project_url}`;

  return get(`${url}`, params);
};

export const findReleases = async (params = {}, project = {}) => {
  const url = `${params.api_url}/projects/${project.id}/releases`;

  return get(`${url}`, params);
};

export const findCommits = async (params = {}, project = {}, config = {}, release) => {
  const url = `${params.api_url}/projects/${project.id}/repository/commits`;
  const all = `?all=false`;
  const ref_name = `&ref_name=${config.branch}`;
  const since = (config.type === 'release') && release ? `&since=${release.commit.created_at}` : '';
  const page = '&page=1&per_page=10000';

  return get(`${url}${all}${ref_name}${since}${page}`, params);
};

export const findRequests = async (params = {}, project = {}, config = {}, release) => {
  const url = `${params.api_url}/projects/${project.id}/merge_requests`;
  const branch = `?target_branch=${config.branch}`;
  const created_after = release ? `&created_after=${release.commit.created_at}` : '';
  const state = '&state=merged';
  const order_by = `&order_by=${{ 'merged_at': 'created_at' }[config['sort-merge-requests-by']]}`;
  const sort = `&sort=${{ descending: 'desc', ascending: 'asc' }[config['sort-merge-requests-direction']]}`;
  const page = '&page=1&per_page=10000';

  return get(`${url}${branch}${created_after}${state}${page}${order_by}${sort}`, params);
};

export const createRelease = async (params = {}, project = {}, release) => {
  const url = `${params.api_url}/projects/${project.id}/releases`;

  return post(`${url}`, { token: params.token, data: release });
};

async function get(url, params) {
  try {
    const { data } = await axios.get(url, { headers: { 'PRIVATE-TOKEN': params.token } });
    return data;
  } catch (error) {
    console.log(error);
    logger.error(error);
  }
}

async function post(url, params) {
  try {
    const { data } = await axios.post(url, params.data, { headers: { 'PRIVATE-TOKEN': params.token } });
    return data;
  } catch (error) {
    console.log(error);
    logger.error(error);
  }
}
