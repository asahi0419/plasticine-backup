import db from '../../../../../../data-layer/orm/index.js';

export default async () => {
  const accountId = await db.model('account').pluck('id').where({ email: process.env.APP_ADMIN_USER, status: 'active' }).getOne();
  try {
    const userId = await db.model('user').pluck('id').where({ account: accountId}).getOne();
    return {admin_user: {id : userId, email : process.env.APP_ADMIN_USER} };
  }catch (e) {
    return {admin_user: {id : 1, email : process.env.APP_ADMIN_USER} };
  }
};
