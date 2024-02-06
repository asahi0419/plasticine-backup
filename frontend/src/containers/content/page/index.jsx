import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, filter } from 'lodash/collection';

import Sandbox from '../../../sandbox';
import { loadPage } from '../../../actions/db';
import { closePage, openPage } from '../../../actions/view/page';
import { handleAction } from '../../../actions/view/actions';
import Page from '../../../components/content/page';
import Loader from '../../../components/shared/loader';
import history from '../../../history';
import ThemeManager from '../../../components/theme/manager';

class PageContainer extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,
    params: PropTypes.object.isRequired,

    page: PropTypes.object,
    user: PropTypes.object,
    variables: PropTypes.object,
    actions: PropTypes.array,
    attachments: PropTypes.array,
    settings: PropTypes.object,

    loadPage: PropTypes.func.isRequired,
    openPage: PropTypes.func.isRequired,
    closePage: PropTypes.func.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return (this.props.ready !== nextProps.ready)
        || (this.props.params.pageAlias !== nextProps.params.pageAlias)
        || (this.props.location.hash !== nextProps.location.hash);
  }

  componentDidMount() {
    this.openPage();
  }

  componentDidUpdate(prevProps) {
    return ((prevProps.params.pageAlias !== this.props.params.pageAlias)
        || (prevProps.location.hash !== this.props.location.hash))
        && this.openPage();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready) {
      document.title = `${nextProps.page.name} - ${window.APP_NAME}`;
    }
  }

  componentWillUnmount () {
    this.props.closePage();
  }

  openPage() {
    const { params, location, route, loadPage } = this.props;
    // Small hack for privileges manager for injecting it to the layout
    if (route.path === '/:modelAlias/privileges') {
      this.props.openPage('privilege_manager', { model: params.modelAlias }, loadPage);
    } else {
      this.props.openPage(params.pageAlias, { ...location.query, ...params }, loadPage);
    }
  }

  renderError(error) {
    const style = {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    };

    return (
      <div style={style}>
        {error}
      </div>
    );
  }

  render() {
    const { error, ready, page, user, variables, actions, attachments, settings, handleAction, theme } = this.props;

    if (error) return this.renderError(error);
    if (!ready) return <Loader dimmer={true} />;

    const sandbox = new Sandbox({ record: page, user, appSettings: settings });

    return (
      <ThemeManager theme={theme}>
        <Page
          page={page}
          theme={theme}
          actions={actions}
          attachments={attachments}
          variables={variables}
          sandbox={sandbox}
          handleAction={handleAction}
        />
      </ThemeManager>
    );
  }
}

function mapStateToProps(state) {
  const { app = {}, view = {}, metadata = {} } = state;
  const { ready, model, params = {} } = view.content || {};
  const { variables, error } = params;
  const { user, settings } = app;

  const theme = find(settings.themes, { alias: settings.theme });

  if (error) return { error };
  if (!ready) return { ready };

  const page = find(metadata.app.page, { alias: model });

  // async componentWillUnmount workaround
  if (!page) return { ready: false };
  // -------------------------------------

  const actions = filter(metadata.app.action, (a) => (page.actions || []).includes(a.id));
  const attachments = filter(metadata.app.attachment, (a) => (page.attachments || []).includes(a.id));

  return { ready, page, actions, attachments, settings, variables, user, theme };
}

export default connect(mapStateToProps, { loadPage, openPage, closePage, handleAction })(PageContainer);
