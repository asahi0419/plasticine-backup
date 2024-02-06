export default {
  name: 'Logout page',
  alias: 'logout',
  template: '<div>{p.getAction(\'logout\')()}</div>',
  access_script: '!p.currentUser.isGuest()',
  actions: [
    {
      name: 'Logout user',
      alias: 'logout',
      condition_script: 'true',
      server_script: `const account = p.currentUser.getAccount();

try {
  await account.closeCurrentSession({ reason_to_close: 'manual' });
  await p.actions.logout({ redirect: await account.getLogoutCallbackUrl() });
} catch (error) {
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
