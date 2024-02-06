import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import styled from 'styled-components';
import { orderBy, map, find } from 'lodash/collection';

import history from '../../../history';
import * as HELPERS from '../../../helpers';

import Content from './content';
import ActionsBar from './actions-bar';
import Dropdown from '../../shared/inputs/dropdown';

const DashboardStyled = styled.div`
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    padding: 14px 0;
  }

  .dashboard-selector {
    display: flex;
    align-items: center;

    .dashboard-selector-label {
      font-weight: bold;
      font-size: 16px;
      margin-right: 10px;
    }
  }
`;

export default class Dashboard extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    actions: PropTypes.array.isRequired,
    dashboards: PropTypes.array.isRequired,
    handleAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    componentsCache: PropTypes.object,
  }

  static contextTypes = {
    sandbox: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.componentsCache = {};
  }

  getChildContext() {
    return { componentsCache: this.componentsCache };
  }

  componentWillMount() {
    this.token = PubSub.subscribe('switch_dashboard_mode', (e, mode = 'view') => this.setState({ mode }));
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  setContent = (props) => {
    const { layout = [] } = HELPERS.parseOptions(props.record.attributes.options);
    this.setState({ mode: 'view', layout: layout, originalLayout: layout });
  }

  handleChange = ({ layout }) => {
    this.props.onChange({ options: { layout } });
    this.setState({ layout });
  }

  handleApplyChanges = () => {
    this.props.onApply(this.state.layout);
  }

  handleCancelChanges = () => {
    this.setState({ mode: 'view', layout: this.state.originalLayout });
  }

  handleEdit = () => {
    const action = find(this.props.actions, { alias: 'edit' }) || {};
    this.context.sandbox.executeScript(action.client_script, `action/${action.id}/client_script`);
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

    this.handleChange({ layout: this.state.layout.concat(widget) });
  }

  renderSelector = () => {
    const value = this.props.record.attributes.alias;
    const options = map(orderBy(this.props.dashboards, ['name']), (d = {}) => ({ value: d.alias, text: d.name }));
    const placeholder = i18n.t('select_dashboard', { defaultValue: 'Select dashboard ...' });
    const onChange = (e, { value }) => history.push(`/dashboard/${value}`);

    return (
      <div className="dashboard-selector">
        <div className="dashboard-selector-label">Dashboards:</div>
        <Dropdown
          search
          selection
          value={value}
          options={options}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
    );
  }

  renderActionsBar = () => {
    const { actions, handleAction } = this.props;
    const { mode = 'view' } = this.state || {};

    const editable = !!actions.find(({ alias }) => alias === 'edit');
    if (!editable) return null;

    return (
      <ActionsBar
        mode={mode}
        onAddWidget={this.handleAddWidget}
        onApplyChanges={this.handleApplyChanges}
        onCancelChanges={this.handleCancelChanges}
        onEdit={this.handleEdit}
        handleAction={handleAction}
      />
    );
  }

  renderHeader() {
    return (
      <div className="dashboard-header">
        {this.renderSelector()}
        {this.renderActionsBar()}
      </div>
    );
  }

  renderContent() {
    const { record } = this.props;
    const { mode = 'view', layout = [] } = this.state || {};

    return (
      <Content
        mode={mode}
        dashboard={record}
        config={{ layout }}
        onChange={this.handleChange}
        style={{ margin: '0 -15px' }}
      />
    );
  }

  render() {
    return (
      <DashboardStyled className="dashboard" style={this.props.style}>
        {this.renderHeader()}
        {this.renderContent()}
      </DashboardStyled>
    );
  }
}
