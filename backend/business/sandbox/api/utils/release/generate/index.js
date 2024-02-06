import * as API from '../api.js';
import * as HELPERS from '../helpers.js';
import * as CONSTANTS from './constants.js';

export default (type) => async (input = {}) => {
  const config = { ...CONSTANTS.DEFAULT_CONFIG[type], ...input.config, type };

  const git = await HELPERS.getGit(input.git);
  const project = await API.findProject(git);
  const releases = await API.findReleases(git, project);
  const releaseLast = HELPERS.getLastRelease(releases, config);

  const commits = await API.findCommits(git, project, config, releaseLast);
  const requests = await API.findRequests(git, project, config, releaseLast);

  const generate = (await import(`./types/${type}.js`)).default;
  const release = generate(git, project, commits, requests, releaseLast, config);

  if (type === 'release') {
    if (config.publish) return API.createRelease(git, project, release);
  }

  return release;
}
