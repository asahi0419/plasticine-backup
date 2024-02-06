import regexEscape from 'escape-string-regexp';
import { orderBy } from 'lodash-es';

import * as HELPERS from '../../helpers.js';

export default (git = {}, project = {}, commits = [], requests = [], release, config = {}) => {
  const sortCommitsBy = config['sort-commits-by'];
  const sortCommitsDir = { 'descending': 'desc', ascending: 'asc' }[config['sort-commits-direction']];
  const commitsAll = orderBy(commits, [sortCommitsBy], [sortCommitsDir]).reverse();

  const result = [];

  const versionInfo = HELPERS.getVersion(
    release,
    config['version-template'],
    config.version || config.tag || config.name,
    HELPERS.resolveVersionKeyIncrement(requests, config)
  );

  let tag_name = config.tag;
  if (!tag_name) tag_name = versionInfo ? HELPERS.template(config['tag-template'], versionInfo) : '';

  let name = config.name;
  if (!name) name = versionInfo ? HELPERS.template(config['name-template'], versionInfo) : '';


  let description = HELPERS.template(config.template, {
    $BRANCH: config.branch,
    $BRANCH_URL: `${git.path}/-/commits/${config.branch}`,
    $PREVIOUS_TAG: release ? release.tag_name : '',
    $CHANGES: generateChangeLog({ requests }, config),
    $CONTRIBUTORS: HELPERS.contributorsSentence({ commits, requests }),
  }, config.replacers);
  if (versionInfo) description = HELPERS.template(description, versionInfo);

  return { ref: config.branch, tag_name, name, description };
}

export const generateChangeLog = (context = {}, config = {}) => {
  const { requests = [] } = context;
  if (!requests.length) return config['no-changes-template'];

  const changeLog = [];

  const escapeTitle = (title) => title.replace(
    new RegExp(`[${regexEscape(config['change-title-escapes'])}]|\`.*?\``, 'g'),
    (match) => {
      if (match.length > 1) return match
      if (match == '@' || match == '#') return `${match}<!---->`
      return `\\${match}`
    }
  );

  const [ uncategorized, categorized ] = HELPERS.categorizeRequests(requests, config)

  const requestsToString = (requests) => requests.map((r) =>
    HELPERS.template(config['change-template'], {
      $TITLE: escapeTitle(r.title),
      $NUMBER: r.iid,
      $AUTHOR: r.author.username || 'ghost',
      $BODY: r.description,
      $URL: r.web_url,
      $LABELS: (r.labels || []).join(', ')
    })).join('\n')

  if (uncategorized.length) {
    changeLog.push(requestsToString(uncategorized))
    changeLog.push('\n\n')
  }

  categorized.map((category, index) => {
    if (category.requests.length) {
      changeLog.push(HELPERS.template(config['category-template'], { $TITLE: category.title }))
      changeLog.push('\n\n')
      changeLog.push(requestsToString(category.requests))
      if (index + 1 !== categorized.length) changeLog.push('\n\n')
    }
  });

  return changeLog.join('').trim()
};
