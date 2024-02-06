import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash/lang';
import { Form } from 'semantic-ui-react';

import { parseOptions } from '../../../../../helpers';

import BaseManager from '../base';
import UserButtons from './user-buttons';
import Tabs from '../../../../shared/tabs';
import MainTab from './tabs/main';
import SortingTab from './tabs/sorting';
import StylingTab from './tabs/styling';
import TabsContainer from '../shared/tabs-container';

export default class LayoutManager extends BaseManager {
  static propTypes = {
    type: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    getAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  setContent(props) {
    this.setState({ record: { ...cloneDeep(props.record), options: parseOptions(props.record.options) } });
  }

  render() {
    const { record } = this.state || {};
    const { formFields, type, getAction } = this.props;

    if (!record) return null;

    return (
      <Form>
        {type === 'user_setting' && <UserButtons getAction={getAction} record={record} type={type} />}
        <TabsContainer record={record} formFields={formFields} hideService={type === 'user_setting'}>
          <Tabs.Pane label={i18n.t('tab_name_main', { defaultValue: 'Main' })}>
            <MainTab
              type={type}
              record={record}
              formFields={formFields}
              onChange={this.onChange}
            />
          </Tabs.Pane>
          {record.type === 'card' &&
            <Tabs.Pane label={i18n.t('tab_name_style', { defaultValue: 'Style' })}>
              <StylingTab record={record} onChange={this.onChange} />
            </Tabs.Pane>}
          {record.type &&
            <Tabs.Pane label={i18n.t('tab_name_sorting', { defaultValue: 'Sorting' })}>
              <SortingTab record={record} onChange={this.onChange} />
            </Tabs.Pane>}
        </TabsContainer>
      </Form>
    );
  }
}
