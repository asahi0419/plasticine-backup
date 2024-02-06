import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isArray } from 'lodash/lang';
import { compact } from 'lodash/array';

import Tabs from '../../../../shared/tabs';
import ServiceTab from './tabs/service';

export default class TabsContainer extends Component {
  static propTypes = {
    children: PropTypes.any,
    formFields: PropTypes.array,
    record: PropTypes.object.isRequired,
    hideService: PropTypes.bool,
  }

  static defaultProps = {
    hideService: false,
  }

  getServiceTab() {
    const { record, formFields, hideService } = this.props;

    return !hideService ? (
      <Tabs.Pane key="service-tab" label={i18n.t('tab_name_service', { defaultValue: 'Service' })}>
        <ServiceTab record={record} formFields={formFields} />
      </Tabs.Pane>
    ) : null;
  }

  renderChildren() {
    const { children } = this.props;

    return compact(isArray(children)
      ? [ ...children, this.getServiceTab() ]
      : [ children, this.getServiceTab() ]);
  }

  render() {
    return <Tabs pointing storeToKey={`form/page/${this.props.record.id}`}>{this.renderChildren()}</Tabs>;
  }
}
