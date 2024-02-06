import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as HELPERS from '../../../../../../helpers';

import Content from '../../../../dashboard/content';
import ActionsBar from '../../../../dashboard/actions-bar';

export default class DashboardTab extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    views: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  setContent = (props) => {
    const { layout = [] } = HELPERS.parseOptions(props.record.attributes.options);
    this.setState({ mode: 'view', layout: layout, originalLayout: layout });
  }

  handleChange = ({ layout }) => {
    this.setState({ layout });
  }

  handleApplyChanges = () => {
    this.props.onChange({ options: { layout: this.state.layout } })
  }

  handleCancelChanges = () => {
    this.setState({ mode: 'view', layout: this.state.originalLayout });
  }

  handleEdit = () => {
    this.setState({ mode: 'edit' });
  }

  handleAddWidget = () => {
    const widget = {
      i: HELPERS.makeUniqueID(),
      x: 0, y: 0, w: 6, h: 8,
      tabs: [{
        id: HELPERS.makeUniqueID(),
        options: {
          active: true,
          name: i18n.t('dashboard_view_widget_tab_default_name', { defaultValue: 'View tab' }),
        },
      }],
      name: i18n.t('dashboard_view_widget_default_name', { defaultValue: 'View widget' }),
    };

    this.setState({ layout: this.state.layout.concat(widget) });
  }

  renderActionsBar = () => {
    const { mode = 'view' } = this.state || {};

    return (
      <ActionsBar
        mode={mode}
        onAddWidget={this.handleAddWidget}
        onApplyChanges={this.handleApplyChanges}
        onCancelChanges={this.handleCancelChanges}
        onEdit={this.handleEdit}
      />
    );
  }

  render() {
    const { record, models, views } = this.props;
    const { mode = 'view', layout = [] } = this.state || {};

    return (
      <div className="dashboard-tab">
        <div style={{ padding: '12px 0' }}>{this.renderActionsBar()}</div>
        <Content
          mode={mode}
          dashboard={record.attributes}
          config={{ models, views, layout }}
          onChange={this.handleChange}
          style={{ margin: '0 -15px' }}
        />
      </div>
    );
  }
}
