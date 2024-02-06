import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { find, filter, sortBy, map } from 'lodash/collection';
import { uniq } from 'lodash/array';

import Dropdown from '../../../shared/inputs/dropdown';

export default class ActionSelectorManager extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      actions: PropTypes.array.isRequired,
      records: PropTypes.array,
      viewOptions: PropTypes.object.isRequired,
    }),

    configs: PropTypes.shape({
      showGroupActions: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      handleAction: PropTypes.func.isRequired,
    }),
  }

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { options: [], value: 0, records: props.props.records };
  }

  componentWillMount() {
    this.token = PubSub.subscribe('set_view_manager_action_selector_state', (_, state) => this.setState(state));
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.ready) return;

    this.setContent(nextProps);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  setContent(props) {
    const actions = sortBy(filter(props.props.actions, { type: 'view_choice' }), ['position']).map((a = {}) => ({ text: a.name, value: a.id }));
    const options = [ { text: i18n.t('select_action', { defaultValue: 'Select action ...' }), value: 0 }, ...actions ];

    this.setState({ options, records: props.props.records });
  }

  getCurrentPage = () => {
    const { viewOptions = {} } = this.props.props;
    const { page = {} } = viewOptions;
    return +page.number;
  }

  actionSelectorHandler = (...args) => {
    const state = { selectedRecords: [], allRecordsSelected: {} };

    this.setState(state, () => PubSub.publish('set_view_grid_state', state));
    this.props.callbacks.handleAction(...args);
  }

  handleSelectAllRecords = () => {
    const curPage = this.getCurrentPage();
    let curPageSelected = this.state.allRecordsSelected[curPage];
    const ids = map(this.props.props.records, 'id');
    const selectedRecords = curPageSelected
      ? this.state.selectedRecords.filter((sr) => !ids.includes(sr))
      : uniq([...this.state.selectedRecords, ...ids]);

    const state = {
      selectedRecords,
      allRecordsSelected: { ...this.state.allRecordsSelected, [curPage]: !curPageSelected }
    };

    this.setState(state, () => PubSub.publish('set_view_grid_state', state));
  }

  handleApplyAction = (e, { value }) => {
    if (value === 0) return;
    clearTimeout(this.delayAction);

    const { model, actions, viewOptions } = this.props.props;
    const { selectedRecords } = this.state;
    const action = find(actions, { id: value });

    this.setState({ value });

    this.delayAction = setTimeout(async () => {
      if (!selectedRecords.length) {
        alert(i18n.t('no_one_record_selected_alert', { defaultValue: 'Please select at least one record to perform the action' }));
        return this.setState({ value: 0 });
      }

      const options = {
        ids: selectedRecords,
        embedded_to: viewOptions.embedded_to,
      };

      if (action.client_script) {
        let result = await this.context.sandbox.executeScript(
          action.client_script,
          { modelId: model.id },
          `action/${action.id}/client_script`
        );

        if (typeof result === 'object') {
          if (result.result === true) {
            options.ui_params = result.ui_params;
            result = true;
          } else {
            result = false;
          }
        }

        if (!result) return this.setState({ value: 0 });
      }

      this.actionSelectorHandler(model, action, options);
      this.setState({ value: 0 });
    }, 100);
  }

  renderManager() {
    const { options, value, allRecordsSelected = {}, records = [] } = this.state;
    if (!records.length) return;

    const allSelected = allRecordsSelected[this.getCurrentPage()];

    return (
      <div style={{ display: 'flex', alignItems: 'baseline', }}>
        <Icon
          name={allSelected ? 'checkmark box' : 'square outline'}
          onClick={this.handleSelectAllRecords}
          style={{ cursor: 'pointer' }}
        />
        <Dropdown
          selection
          placeholder={i18n.t('select_action', { defaultValue: 'Select action ...' })}
          value={value}
          style={{ marginLeft: '5px', width: '300px' }}
          options={options}
          onChange={this.handleApplyAction}
        />
      </div>
    );
  }

  render() {
    if (!this.props.configs.showGroupActions) return null;

    return (
      <div className="view-manager action-selector">
        {this.renderManager()}
      </div>
    );
  }
}
