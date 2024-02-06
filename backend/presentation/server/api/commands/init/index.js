import { reduce } from 'lodash-es';

import * as HELPERS from './helpers.js';

export default async (req, res) => {
  const { sandbox } = req;

  try {
    const authenticated = !sandbox.vm.p.currentUser.isGuest();
    const errors = [];
    const result = await loadPackets(req, authenticated, errors);

    res.json(result);
  } catch (error) {
    res.error(error);
  }
};

export async function loadPackets({ sandbox, i18n }, authenticated, errors = []) {
  const result = {
    translations: HELPERS.getTranslations(i18n.store.data, sandbox.user.language.alias),
    settings: await HELPERS.getSettings(sandbox, authenticated, errors),
    components: await HELPERS.getComponents(),
    pages: await HELPERS.getPages(sandbox, authenticated),
  };
  if (errors.length) result.errors = errors;

  return reduce(result, (r, v, k) => (v ? { ...r, [k]: v } : r), {});
}
