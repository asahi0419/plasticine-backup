import { map } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';

export default async ({ i18next }) => {
  if (!i18next) return;

  const languages = await db.model('language').select('alias').where({ __inserted: true, status: 'active' });
  if (languages.length) i18next.reloadResources(map(languages, 'alias'));
};
