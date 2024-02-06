import { DEFAULT_DATE_FORMAT } from '../../../../../constants/index.js';

export const DEFAULT_CONFIG = {
  release: {
    'branch': 'master',
    'tag-template': 'v$RESOLVED_VERSION',
    'name-template': '',
    'change-template': '* $TITLE [$LABELS] (#$NUMBER) @$AUTHOR',
    'change-title-escapes': '',
    'no-changes-template': `* No changes`,
    'categories': [],
    'exclude-labels': [],
    'include-labels': [],
    'exclude-contributors': [],
    'no-contributors-template': 'No contributors',
    'replacers': [],
    'autolabeler': [],
    'sort-merge-requests-by': 'merged_at',
    'sort-merge-requests-direction': 'descending',
    'sort-commits-by': 'created_at',
    'sort-commits-direction': 'descending',
    'category-template': `## $TITLE`,
    'template': `## Changes:\n\n$CHANGES`,
    'version-template': `$MAJOR.$MINOR.$PATCH`,
    'version-resolver': {
      major: { labels: [] },
      minor: { labels: [] },
      patch: { labels: [] },
      default: 'patch',
    },
  },
  changes: {
    'output': 'json',
    'branch': 'master',
    'build': { 'from': null, 'to': null },
    'merge-request-template': '',
    'change-title-escapes': '',
    'no-changes-template': `* No changes`,
    'exclude-labels': [],
    'include-labels': [],
    'sort-merge-requests-by': 'merged_at',
    'sort-merge-requests-direction': 'descending',
    'sort-commits-by': 'created_at',
    'sort-commits-direction': 'descending',
    'date-format': DEFAULT_DATE_FORMAT,
    'replacers': [],
    'autolabeler': [],
    'categories': [],
    'category-template': `## $TITLE`,
    'template': `## Changes:

| Branch | Previous Build | Current Build | Slice Count | Head Count | Build Count |
| ------ | -------------- | ------------- | ----------- | ---------- | ----------- |
| [$BRANCH]($BRANCH_URL) | $BUILD_FROM | $BUILD_TO | $SLICE_COUNT | $HEAD_COUNT | $BUILD_COUNT |

## Commits Slice:

| ID | Type | Title | Author | Date |
| -- | ---  | ----- | -----  | ---- |
$COMMITS_SLICE

## Commits Build:

| ID | Type | Title | Author | Date |
| -- | ---  | ----- | -----  | ---- |
$COMMITS_BUILD

## Commits Need Merge:

| ID | Type | Title | Author | Date | Merge Request |
| -- | ---  | ----- | -----  | ---- | ------------- |
$COMMITS_NEED_MERGE`,
    'commit-slice-template': `| [$SHORT_ID]($URL) | $TYPE | $TITLE | [$AUTHOR_NAME]($AUTHOR_EMAIL) | $CREATED_AT |`,
    'commit-template': `| [$SHORT_ID]($URL) | $TYPE | $TITLE | [$AUTHOR_NAME]($AUTHOR_EMAIL) | $CREATED_AT |`,
    'commit-need-merge-template': `| [$SHORT_ID]($URL) | $TYPE | $TITLE | [$AUTHOR_NAME]($AUTHOR_EMAIL) | $CREATED_AT | [$MERGE_REQUEST_SHORT_ID]($MERGE_REQUEST_URL) |`,
  },
};
