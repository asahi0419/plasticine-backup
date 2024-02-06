import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PlasticineApi from '../../../../../../api';
import history from '../../../../../../history';
import ContextMenu from '../../../../../shared/context-menu';

export default class TabLabelContextMenu extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    tabId: PropTypes.string.isRequired,
    formId: PropTypes.number.isRequired,
    model: PropTypes.object.isRequired,
  }

  handleOpenTabLabelTranslation = () => {
    const { tabId, formId, type, label } = this.props;

    return PlasticineApi.loadTranslation('form', formId, 'options', { path: `${type}/options/${tabId}/name`, default: label })
      .then(({ data: { id } }) => history.push(`/json_translation/form/${id}`));
  }

  render() {
    const { model, children } = this.props;

    const actions = [];

    actions.push({
      name: i18n.t('translate', { defaultValue: 'Translate' }),
      condition_script: 'p.currentUser.isAdmin()',
      handler: () => this.handleOpenTabLabelTranslation(),
    });

    return (
      <ContextMenu simple model={model} actions={actions}>
        {children}
      </ContextMenu>
    );
  }
}
