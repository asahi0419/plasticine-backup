export default {
  name: 'SSO No Access',
  alias: 'sso_no_access',
  template: `<div className="container">
  <Header as="h2">
    Dear <span className="email">{page.state.email}</span>, you don't have access to <span className="project">{page.state.project}</span> now.
    <br/>
    Would you like to <Link to={page.state.createTicketURL}>create a ticket</Link> for the IT team in order to request access?
  </Header>
  <Button as={Link} to="/pages/login" basic>Back to login page</Button>
</div>`,
  server_script: '',
  component_script: `{
  initState: () => {
    const query = qs.parse(window.location.search.replace(/^\\?/, ''));

    return {
      strategy: query.strategy,
      email: query.email,
      project: p.getSetting('project_name'),
      createTicketURL: '/',
    };
  }
}`,
  styles: `padding: 50px;

.container {
  width: 520px;
  margin: 0 auto;
  padding-top: 400px;
  vertical-align: middle;
  text-align: center;
}

.header {
  font-weight: normal;

  span, a {
    font-weight: bold;
    color: {headerBackground} !important;
  }
}

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  display: flex;
  align-items: center;
  min-height: 100%;

  .container {
    width: 100%;
    padding-top: 0;
  }
}`,
  access_script: 'p.currentUser.isGuest()',
  __lock: ['delete'],
};
