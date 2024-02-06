import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ContextMenu from '../../../../../shared/context-menu';

export default class SettingsContextMenu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }

  render() {
    const { model, view, children } = this.props;

    const actions = [
      {
        name: i18n.t('Layout', { defaultValue: 'Layout' }),
        condition_script: 'p.currentUser.isAdmin()',
        as: 'link',
        url: `/layout/form/${view.layout || 'new'}`,
        target: '_blank',
      },
      {
        name: i18n.t('Appearance', { defaultValue: 'Appearance' }),
        condition_script: 'p.currentUser.isAdmin()',
        as: 'link',
        url: `/layout/form/${view.appearance || 'new'}`,
        target: '_blank',
      },
    ];

    return (
      <ContextMenu simple model={model} actions={actions}>
        {children}
      </ContextMenu>
    );
  }
}
