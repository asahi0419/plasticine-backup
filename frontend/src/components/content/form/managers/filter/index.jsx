import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash/lang';
import { Form } from 'semantic-ui-react';

import BaseManager from '../base';
import Tabs from '../../../../shared/tabs';
import MainTab from './tabs/main';
import TabsContainer from '../shared/tabs-container';

export default class FilterManager extends BaseManager {
  static propTypes = {
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
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
    this.setState({ record: cloneDeep(props.record) });
  }

  render() {
    const { formFields } = this.props;
    const { record } = this.state;

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
