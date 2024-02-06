import url from 'url';
import lodash from 'lodash';
import semver from 'semver';
import compareVersions from 'compare-versions';

export const getGit = async (params = {}) => {
  const result = { ...params };

  if (params.path) {
    const location = url.parse(params.path);
    result.host_url = `${location.protocol}//${location.host}`;
    result.api_url = `${result.host_url}/api/v4`;
    result.project_url = `${result.api_url}/projects/${encodeURIComponent(location.pathname.slice(1))}?statistics=yes`;
  }

  return result;
};

export const template = (string, obj, customReplacers) => {
  let str = string.replace(/(\$[A-Z_]+)/g, (_, k) => {
    let result
    if (obj[k] === undefined || obj[k] === null) {
      result = k
    } else if (typeof obj[k] === 'object') {
      result = template(obj[k].template, obj[k])
    } else {
      result = `${obj[k]}`
    }
    return result
  })
  if (customReplacers) {
    customReplacers.forEach(({ search, replace }) => {
      str = str.replace(search, replace)
    })
  }
  return str
}

export const getVersion = (release, template, inputVersion, versionKeyIncrement) => {
  const version = coerceVersion(release);
  inputVersion = coerceVersion(inputVersion);

  if (version || inputVersion) {
    return {
      ...getTemplatableVersion({
        version,
        template,
        inputVersion,
        versionKeyIncrement,
      }),
    };
  }
};

function splitSemVer(input, versionKey = 'version') {
  if (!input[versionKey]) return

  const version = input.inc
    ? semver.inc(input[versionKey], input.inc, true)
    : semver.parse(input[versionKey])

  return {
    ...input,
    version,
    $MAJOR: semver.major(version),
    $MINOR: semver.minor(version),
    $PATCH: semver.patch(version),
  }
}

function getTemplatableVersion(input) {
  const templatableVersion = {
    $NEXT_MAJOR_VERSION: splitSemVer({ ...input, inc: 'major' }),
    $NEXT_MINOR_VERSION: splitSemVer({ ...input, inc: 'minor' }),
    $NEXT_PATCH_VERSION: splitSemVer({ ...input, inc: 'patch' }),
    $INPUT_VERSION: splitSemVer(input, 'inputVersion'),
    $RESOLVED_VERSION: splitSemVer({
      ...input,
      inc: input.versionKeyIncrement || 'patch',
    }),
  }

  templatableVersion.$RESOLVED_VERSION = templatableVersion.$INPUT_VERSION || templatableVersion.$RESOLVED_VERSION

  return templatableVersion
}

function coerceVersion(input) {
  if (!input) return;

  return typeof input === 'object'
    ? semver.coerce(input.tag_name) || semver.coerce(input.name)
    : semver.coerce(input)
}

export function resolveVersionKeyIncrement(requests = [], config = {}) {
  const priorityMap = { patch: 1, minor: 2, major: 3 };
  const labelToKeyMap = Object.fromEntries(
    Object.keys(priorityMap)
      .flatMap((key) => [config['version-resolver'][key].labels.map((label) => [label, key])])
      .flat());

  const keys = requests
    .filter(getFilterExcludedRequests(config['exclude-labels']))
    .filter(getFilterIncludedRequests(config['include-labels']))
    .flatMap((r) => r.labels.map((l) => labelToKeyMap[l]))
    .filter(Boolean);

  const priority = Math.max(...keys.map((key) => priorityMap[key]));
  const versionKey = Object.keys(priorityMap).find((key) => priorityMap[key] === priority);

  return versionKey || config['version-resolver'].default;
}

export const getLastRelease = (releases = [], config = {}) => {
  let sorted;

  if (config['tag-template']) {
    const [ prefix ] = config['tag-template'].split('$');
    if (prefix) releases = lodash.filter(releases, (r) => r.tag_name.startsWith(prefix));
  }

  try {
    sorted = releases.sort((r1, r2) => compareVersions(r1.tag_name, r2.tag_name))
  } catch (error) {
    sorted = releases.sort((r1, r2) => new Date(r1.created_at) - new Date(r2.created_at))
  }

  return sorted[sorted.length - 1];
};

export function contributorsSentence({ commits, requests }) {
  const contributors = new Set()

  commits.forEach((c) => c.author_email
    ? contributors.add(`@${c.author_email}`)
    : contributors.add(c.author_name));

  requests.forEach((r) => r.author_email
    ? contributors.add(`@${r.author_email}`)
    : contributors.add(r.author_name));

  const sorted = Array.from(contributors).sort();

  if (sorted.length > 1) {
    return (sorted.slice(0, sorted.length - 1).join(', ') + ' and ' + sorted.slice(-1));
  } else {
    return sorted[0];
  }
}

export function getFilterExcludedRequests(labels) {
  return (r) => !(r.labels.some((l) => labels.includes(l)));
}

export function getFilterIncludedRequests(labels) {
  return (r) => (labels.length == 0 || r.labels.some((l) => labels.includes(l)));
}

export function getFilterUncategorizedRequests(all, uncategorized) {
  return (r) => {
    if (r.labels.length === 0 || !r.labels.some((l) => all.includes(l))) {
      uncategorized.push(r)
      return false
    }
    return true
  }
}

export function categorizeRequests(requests = [], config = {}) {
  const labels = config.categories.flatMap((c) => c.labels);
  const uncategorized = [];
  const categorized = [ ...config.categories ].map((c) => ({ ...c, requests: [] }));

  const filtered = requests
    .filter(getFilterExcludedRequests(config['exclude-labels']))
    .filter(getFilterIncludedRequests(config['include-labels']))
    .filter(getFilterUncategorizedRequests(labels, uncategorized))

  categorized.map((c) => {
    filtered.map((f) => {
      if (f.labels.some((l) => c.labels.includes(l))) {
        c.requests.push(f)
      }
    })
  })

  return [ uncategorized, categorized ]
}
