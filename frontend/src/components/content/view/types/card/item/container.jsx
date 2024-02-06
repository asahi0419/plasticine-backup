import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Item from './index';
import withRecordSandbox from '../../../../../../containers/hoc/with-record-sandbox';

class ItemContainer extends Component {
  static propTypes = {
    ...Item.propTypes,
  };

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
  }

  getAccessibleActions = () => {
    const { model, actions } = this.props;

    return actions.filter(({ id, type, condition_script }) =>
      type === 'card_view' && this.context.sandbox.executeScript(condition_script, { modelId: model.id }, `action/${id}/condition_script`)
    );
  }

  render() {
    const { record } = this.context;

    return (
      <Item {...this.props} actions={this.getAccessibleActions()} record={record} />
    );
  }
}

function mapStateToProps(state) {
  return { user: state.app.user };
}

export default connect(mapStateToProps)(withRecordSandbox(ItemContainer));
