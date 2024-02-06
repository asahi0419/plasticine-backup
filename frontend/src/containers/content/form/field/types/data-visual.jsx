import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { isEmpty } from 'lodash/lang';

import { parseOptions } from '../../../../../helpers';
import connector from '../connector';
import BaseContainer from './base';
import Field from '../../../../../components/content/form/field/types/data-visual';

class DataVisualContainer extends BaseContainer {
  renderPlaceholder() {
    const content = this.props.ready
      ? this.props.template
        ? i18n.t('configure_fields_to_display', { defaultValue: 'Please configure fields to display' })
        : i18n.t('finalise_the_record_creation_to_manage_the_field', { defaultValue: 'Please finalise the record creation to manage the field' })
      : this.props.value
        ? i18n.t('data_visual_loading', { defaultValue: 'Data visual loading ...' })
        : i18n.t('finalise_the_record_creation_to_manage_the_field', { defaultValue: 'Please finalise the record creation to manage the field' });

    return <Segment>{content}</Segment>;
  }

  renderContent() {
    const props = this.getProps();

    return (
      <Field
        {...props}
        template={this.props.template}
      />
    );
  }

  renderField() {
    const { attr: value } = parseOptions(this.props.value);

    return isEmpty(value) ? this.renderPlaceholder() : this.renderContent();
  }
}

export default connector(DataVisualContainer);
