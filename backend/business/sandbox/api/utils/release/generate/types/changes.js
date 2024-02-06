import moment from 'moment';
import regexEscape from 'escape-string-regexp';
import { toArray, orderBy, keyBy, each, reduce } from 'lodash-es';

import * as HELPERS from '../../helpers.js';

export default (git = {}, project = {}, commits = [], requests = [], release, config = {}) => {
  if (!config.build) config.build = { from: 0, to: commits.length };
  if (!config.build.from) config.build.from = 0;
  if (!config.build.to) config.build.to = commits.length;

  const sortCommitsBy = config['sort-commits-by'];
  const sortCommitsDir = { 'descending': 'desc', ascending: 'asc' }[config['sort-commits-direction']];

  const commitsAll = orderBy(commits, [sortCommitsBy], [sortCommitsDir]).reverse();

  const commitsMapHead = keyBy(commitsAll.slice(0, config.build.to), 'id');
  const commitsMapAhead = keyBy(commitsAll.slice(config.build.to), 'id');
  const commitsMapSlice = keyBy(commitsAll.slice(config.build.from, config.build.to), 'id');

  const commitsNeedMerge = reduce(commitsMapAhead, (r, c) => {
    if (c.title.includes('Merge branch')) {
      each(c.parent_ids, (pid) => {
        if (commitsMapSlice[pid]) {
          commitsMapSlice[pid].need_merge = c;
          r.push(commitsMapSlice[pid]);
        }
      })
    }
    return r;
  }, []).reverse();
  const commitsSlice = toArray(commitsMapSlice).reverse();
  const commitsBuild = commitsSlice.filter((c) => !c.need_merge);

  let all_count = commitsAll.length;
  let slice_count = commitsSlice.length;
  let head_count = toArray(commitsMapHead).filter((c) => !c.need_merge).length;
  let ahead_count = toArray(commitsMapAhead).length;
  let build_count = commitsBuild.length;
  let commit_need_merge_count = commitsNeedMerge.length;

  let body = HELPERS.template(config.template, {
    $BRANCH: config.branch,
    $BRANCH_URL: `${git.path}/-/commits/${config.branch}`,
    $BUILD_FROM: config.build.from,
    $BUILD_TO: config.build.to,
    $ALL_COUNT: slice_count,
    $SLICE_COUNT: slice_count,
    $HEAD_COUNT: head_count,
    $AHEAD_COUNT: ahead_count,
    $BUILD_COUNT: build_count,
    $COMMIT_NEED_MERGE_COUNT: commit_need_merge_count,
    $PREVIOUS_TAG: release ? release.tag_name : '',
    $COMMITS_SLICE: generateChangeLog({ commitsSlice }, config),
    $COMMITS_BUILD: generateChangeLog({ commitsBuild }, config),
    $COMMITS_NEED_MERGE: generateChangeLog({ commitsNeedMerge }, config),
    $CONTRIBUTORS: HELPERS.contributorsSentence({ commits, requests }),
  }, config.replacers);

  if (config.output === 'markdown') {
    console.log({ body });
    return body;
  }

  if (config.output === 'json') {
    return {
      branch: config.branch,
      build: config.build,
      all_count,
      slice_count,
      head_count,
      ahead_count,
      build_count,
      commit_need_merge_count,
      commits_build: commitsBuild,
      commits_slice: commitsSlice,
      commits_need_merge: commitsNeedMerge,
    };
  }
};

export const generateChangeLog = (context = {}, config = {}) => {
  const { commitsSlice, commitsNeedMerge, commitsBuild } = context;
  const changeLog = [];

  const escapeTitle = (title) => title.replace(
    new RegExp(`[${regexEscape(config['change-title-escapes'])}]|\`.*?\``, 'g'),
    (match) => {
      if (match.length > 1) return match
      if (match == '@' || match == '#') return `${match}<!---->`
      return `\\${match}`
    }
  );

  if (commitsSlice && config['commit-slice-template']) {
    if (!commitsSlice.length) return config['no-changes-template'];
    const commitsToString = (commits) => {
      return commitsSlice.map((c = {}) => {
        const { need_merge = {} } = c;
        return HELPERS.template(config['commit-slice-template'], {
          $ID: c.id,
          $SHORT_ID: c.short_id,
          $TYPE: escapeTitle(c.title.toLowerCase()).includes('add') ? 'Add' : 'Fix',
          $TITLE: escapeTitle(c.title),
          $AUTHOR_NAME: c.author_name || 'ghost',
          $AUTHOR_EMAIL: c.author_email || 'ghost',
          $MESSAGE: c.message,
          $URL: c.web_url,
          $CREATED_AT: moment(c.created_at).format(config['date-format']),
        });
      }).join('\n');
    }
    changeLog.push(commitsToString(commitsSlice))
  }

  if (commitsBuild && config['commit-template']) {
    if (!commitsBuild.length) return config['no-changes-template'];
    const commitsToString = (commits) => {
      return commitsBuild.map((c = {}) => {
        const { need_merge = {} } = c;
        return HELPERS.template(config['commit-template'], {
          $ID: c.id,
          $SHORT_ID: c.short_id,
          $TYPE: escapeTitle(c.title.toLowerCase()).includes('add') ? 'Add' : 'Fix',
          $TITLE: escapeTitle(c.title),
          $AUTHOR_NAME: c.author_name || 'ghost',
          $AUTHOR_EMAIL: c.author_email || 'ghost',
          $MESSAGE: c.message,
          $URL: c.web_url,
          $CREATED_AT: moment(c.created_at).format(config['date-format']),
        });
      }).join('\n');
    }
    changeLog.push(commitsToString(commitsBuild))
  }

  if (commitsNeedMerge && config['commit-need-merge-template']) {
    if (!commitsNeedMerge.length) return config['no-changes-template'];
    const commitsToString = (commits) => {
      return commitsNeedMerge.map((c = {}) => {
        const { need_merge = {} } = c;
        return HELPERS.template(config['commit-need-merge-template'], {
          $ID: c.id,
          $SHORT_ID: c.short_id,
          $TYPE: escapeTitle(c.title.toLowerCase()).includes('add') ? 'Add' : 'Fix',
          $TITLE: escapeTitle(c.title),
          $AUTHOR_NAME: c.author_name || 'ghost',
          $AUTHOR_EMAIL: c.author_email || 'ghost',
          $MESSAGE: c.message,
          $URL: c.web_url,
          $MERGE_REQUEST_SHORT_ID: need_merge.id,
          $MERGE_REQUEST_URL: need_merge.web_url,
          $CREATED_AT: moment(c.created_at).format(config['date-format']),
        });
      }).join('\n');
    }
    changeLog.push(commitsToString(commitsNeedMerge))
  }

  return changeLog.join('').trim()
};
