import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash'
import { connect } from 'react-redux';
import { Message } from 'semantic-ui-react';

import store from '../../../store';
import Sandbox from '../../../sandbox';
import loadPageVariables from '../../../actions/db/load-page-variables'
import { loadPage } from '../../../actions/db/load-page'
import { handleAction } from '../../../actions/view/actions';

import Page from '../../content/page';
import Modal from '../modal';
import Loader from '../loader';

class PageModal extends React.Component {
  static propTypes = {
    pageAlias: PropTypes.string.isRequired,
    opened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    options: PropTypes.object,
    parent: PropTypes.object,
    params: PropTypes.object,
    handleAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: null,
      page: null,
    };
  }

  async componentDidMount() {
    const state = store.redux.instance.getState()
    const result = await loadPage(state, this.props.pageAlias)

    if (result.page) {
      this.setState({
        page: result.page,
        actions: Object.values(result.entities.action || {}) || [],
        variables: await loadPageVariables(result.page, this.props.params) || {},
        theme: lodash.find(state.app.themes, { alias: state.app.settings.theme }),
        loading: false,
      })
    } else {
      this.setState({
        error: i18n.t('page_not_found_error'),
        loading: false,
      })
    }
  }

  renderLoader() {
    if (!this.state.loading) return

    return (
      <Loader compact={true} />
    )
  }

  renderError() {
    if (!this.state.error) return

    return (
      <Message negative style={{ margin: '14px 0' }}>
        <p>{i18n.t('page_not_found_error')}</p>
      </Message>
    )
  }

  renderPage() {
    if (!this.state.page) return

    const sandbox = new Sandbox({
      uiObject: {
        attributes: { __type: 'page' },
        parent: this.props.parent,
        options: {
          ...this.props.options,
          onClose: this.props.onClose,
        },
      } })

    return (
      <Page
        page={this.state.page}
        actions={this.state.actions}
        variables={this.state.variables}
        handleAction={this.props.handleAction}
        sandbox={sandbox}
      />
    )
  }

  render() {
    return (
      <Modal opened={this.props.opened} onClose={() => this.props.onClose()}>
        {this.renderLoader()}
        {this.renderError()}
        {this.renderPage()}
      </Modal>
    );
  }
}

export default connect(() => ({}), { handleAction })(PageModal);