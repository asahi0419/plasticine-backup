import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

import EmbeddedView from '../../../../../../../view/embedded';

export default class View extends Component {
  static propTypes = {
    options: PropTypes.shape({
      model: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      view: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      filter: PropTypes.string,
    }).isRequired,
    dashboard: PropTypes.object,
  };

  shouldComponentUpdate(nextProps) {
    return !lodash.isEqual(this.props.options, nextProps.options);
  }

  render() {
    if (this.props.options.model && this.props.options.view) {
      return (
        <EmbeddedView
          props={{
            context: 'dashboard_view',
            modelAlias: this.props.options.model,
            viewAlias: this.props.options.view,
            statical: true,
            params: {
              filter: this.props.options.filter,
              exec_by: {
                type: 'dashboard_view',
                alias: this.props.options.view,
              },
              embedded_to: {
                model: 'dashboard',
                record_id: this.props.dashboard.id,
              },
            },
          }}
        />
      );
    }

    return (
      <Message negative style={{ margin: '14px 0' }}>
        <p>{i18n.t('no_access_to_view_error', { defaultValue: 'You have no access to the view' })}</p>
      </Message>
    );
  }
}
