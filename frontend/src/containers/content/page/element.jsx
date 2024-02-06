import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, filter } from 'lodash/collection';

import store from '../../../store';
import Sandbox from '../../../sandbox';
import loadPage from '../../../actions/db/load-page';
import { handleAction } from '../../../actions/view/actions';

import Page from '../../../components/content/page';

class PageElementContainer extends Component {
  static propTypes = {
    alias: PropTypes.string.isRequired,
    page: PropTypes.object,
    actions: PropTypes.array,
    variables: PropTypes.object,
    params: PropTypes.object,
    theme: PropTypes.object.isRequired,
    user: PropTypes.object,
    appSettings: PropTypes.object,
    handleAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      page: props.page,
      actions: props.actions,
      variables: props.variables,
    };
  }

  async componentDidMount() {
    const loader = loadPage(this.props.alias, { ...(this.props.params || {}), element: true });

    const { page, actions, variables } = await loader(
      store.redux.instance.dispatch,
      store.redux.instance.getState,
    );
    this.setState({ page, actions, variables });
  }

  render() {
    const { user, theme, appSettings, handleAction, ...rest } = this.props;
    const { page, actions, variables } = this.state;

    if (!page) return null;
    if (!user) return null;

    const sandbox = new Sandbox({ record: page, user, appSettings });

    return (
      <Page
        {...rest}
        page={page}
        theme={theme}
        actions={actions}
        variables={variables}
        sandbox={sandbox}
        handleAction={handleAction}
      />
    );
  }
}

function mapStateToProps(state, props) {
  const { app = {}, view = {}, metadata = {} } = state;
  const { user, settings } = app;
  const { content = {} } = view;
  const { params = {} } = content;
  const { variables = {}, error } = params;

  const page = find(metadata.app.page, { alias: props.alias });
  const actions = filter(metadata.app.action, (a) => ((page || {}).actions || []).includes(a.id)) || [];

  const theme = find(settings.themes, { alias: settings.theme });
  const appSettings = settings;

  return { page, actions, variables, user, appSettings, theme };
}

export default connect(mapStateToProps, { handleAction })(PageElementContainer);
