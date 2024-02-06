import { loadItems, loadUsers } from './helpers.js';

export default async (req, res) => {
  try {
    const items = await loadItems(req);
    const users = await loadUsers(items, req.sandbox);

    res.json({ items, users });
  } catch (error) {
    res.error(error);
  }
};
