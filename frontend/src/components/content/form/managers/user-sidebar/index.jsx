import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, isEmpty } from 'lodash/lang';
import { Form } from 'semantic-ui-react';

import { parseOptions } from '../../../../../helpers';

import BaseManager from '../base';
import Tabs from '../../../../shared/tabs';
import MainTab from './tabs/main';
import TabsContainer from '../shared/tabs-container';

export default class UserSidebarManager extends BaseManager {
  static propTypes = {
    formFields: PropTypes.array,
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  setContent(props) {
    const record = cloneDeep(props.record);
    record.options = parseOptions(record.options);
    if (isEmpty(record.options)) record.options = { components: { options: {}, list: [] }, sort_order: [] };

    this.setState({ record });
  }

  render() {
    const { record } = this.state || {};
    const { formFields } = this.props;

    if (!record) return null;

    return (
      <Form>
        <TabsContainer record={record} formFields={formFields}>
          <Tabs.Pane label={i18n.t('tab_name_main', { defaultValue: 'Main' })}>
            <MainTab record={record} formFields={formFields} onChange={this.onChange} />
          </Tabs.Pane>
        </TabsContainer>
      </Form>
    );
  }
}
