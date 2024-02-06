import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash/lang';
import { Form } from 'semantic-ui-react';

import BaseManager from '../base';
import Tabs from '../../../../shared/tabs';
import MainTab from './tabs/main';
import TabsContainer from '../shared/tabs-container';

export default class PermissionManager extends BaseManager {
  static propTypes = {
    formFields: PropTypes.array.isRequired,
    fields: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    fetchVariables: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  setContent(props) {
    const record = cloneDeep(props.record);

    this.setState({ record });
  }

  render() {
    const { record } = this.state || {};
    const { formFields, fields, model, fetchVariables } = this.props;

    if (!record) return null;

    return (
      <Form>
        <TabsContainer record={record} formFields={formFields}>
          <Tabs.Pane label={i18n.t('tab_name_main', { defaultValue: 'Main' })}>
            <MainTab
              record={record}
              formFields={formFields}
              fields={fields}
              model={model}
              onChange={this.onChange}
              fetchVariables={fetchVariables}
            />
          </Tabs.Pane>
        </TabsContainer>
      </Form>
    );
  }
}
