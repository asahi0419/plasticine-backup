import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PlasticineApi from '../../../api';
import Dashboard from '../../../components/content/dashboard';
import withRecordSandbox from '../../hoc/with-record-sandbox';

class Provider extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    actions: PropTypes.array.isRequired,
    dashboards: PropTypes.array.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  static contextTypes = {
    record: PropTypes.object.isRequired,
    sandbox: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props);

    this.state = { record: context.record };
  }

  getAccessibleActions = () => {
    const { model = {}, actions = [] } = this.props;
    const { sandbox } = this.context;

    return actions.filter((a = {}) => sandbox.executeScript(a.condition_script, { modelId: model.id }, `action/${a.id}/condition_script`));
  }

  handleChange = (attributes) => {
    this.context.record.update(attributes);
  }

  handleApply = (layout) => {
    this.props.record.created_by === this.props.user.attributes.id
      ? PlasticineApi.updateUserSettings('dashboard', this.props.record.id, { type: 'main', options: { layout } })
      : PlasticineApi.updateRecord('dashboard', this.props.record.id, { data: { attributes: { options: { layout } } } });

    this.setState({ record: this.context.record });
  }

  render() {
    const actions = this.getAccessibleActions();

    return (
      <Dashboard
        actions={actions}
        record={this.state.record}
        dashboards={this.props.dashboards}
        handleAction={this.props.handleAction}
        onChange={this.handleChange}
        onApply={this.handleApply}
      />
    );
  }
}

export default withRecordSandbox(Provider);
