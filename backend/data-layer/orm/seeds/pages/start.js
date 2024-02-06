export default {
  name: 'Start page',
  alias: 'start',
  server_script: `p.response.json({
    is_guest: p.currentUser.isGuest(),
});`,
  component_script: `{
  initState: () => ({
    isGuest: p.getVariable('is_guest'),
  }),
}`,
  styles: `display: flex;
justify-content: center;
align-items: center;
text-align: center;
height: 100%;
padding: 20px;`,
  template: `<div>
  You have no access to the system yet.
  {!page.state.isGuest && <div style={{ marginTop: '20px' }}>
    <Link to="/pages/logout">{p.translate('logout', { defaultValue: 'Logout' })}</Link>
  </div>}
</div>`,
  access_script: 'true',
  __lock: ['delete'],
};
