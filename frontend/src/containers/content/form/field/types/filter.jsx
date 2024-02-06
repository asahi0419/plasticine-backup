import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';

import connector from '../connector';
import BaseContainer from './base';
import Field from '../../../../../components/content/form/field/types/filter';

class FilterContainer extends BaseContainer {
  renderPlaceholder() {
    const content = i18n.t('filter_loading', { defaultValue: 'Filter loading ...' });

    return <Segment>{content}</Segment>;
  }

  renderField() {
    const props = this.getProps();

    return <Field {...props} reloadField={this.reloadField} />
  }
}

export default connector(FilterContainer);
