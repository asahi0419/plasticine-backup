import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import PlasticineApi from '../../../../../../api';
import history from '../../../../../../history';

import Messenger from '../../../../../../messenger';
import ContextMenu from '../../../../../shared/context-menu';
import { parseOptions } from '../../../../../../helpers';

export default class FieldLabelContextMenu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
    getRecordValue: PropTypes.func,
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.children.props, this.props.children.props);
  }

  handleOpenLabelTranslation = () => {
    const { field } = this.props;

    return PlasticineApi.loadTranslation('field', field.id, 'name')
      .then(({ data: { id } }) => history.push(`/dynamic_translation/form/${id}`));
  }

  handleOpenContentTranslation = () => {
    const { field, model, getRecordValue } = this.props;

    const loader = field.type === 'array_string'
      ? PlasticineApi.loadTranslation('field', field.id, 'options')
      : PlasticineApi.loadTranslation(model.alias, getRecordValue('id'), field.alias);

    return loader.then(({ data: { id }}) => history.push(`/dynamic_translation/form/${id}`));
  }

  handleCopyAlias = () => {
    const { alias } = this.props.field;

    const el = document.createElement('textarea');
    el.value = alias;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    Messenger.info({ content: i18n.t('copied_field_alias', { defaultValue: `Field alias '${alias}' has copied to clipboard`, alias }) });
  }

  render() {
    const { model, field, children, getRecordValue } = this.props;

    const actions = [];

    if (parseOptions(field.options).subtype !== 'option') {
      actions.push({
        name: i18n.t('configure', { defaultValue: 'Configure' }),
        condition_script: 'p.currentUser.isAdmin()',
        as: 'link',
        url: `/field/form/${field.id}`,
        target: '_blank',
      });

      actions.push({
        name: `${i18n.t('copy_field_alias', { defaultValue: 'Copy alias' })} '${field.alias}'`,
        condition_script: 'p.currentUser.isAdmin()',
        handler: () => this.handleCopyAlias(),
      });

      actions.push({
        name: i18n.t('translate', { defaultValue: 'Translate' }),
        condition_script: 'p.currentUser.isAdmin()',
        handler: () => this.handleOpenLabelTranslation(),
      });

      if (['string', 'array_string'].includes(field.type) && getRecordValue) {
        actions.push({
          name: i18n.t('translate_content', { defaultValue: 'Translate content' }),
          condition_script: 'p.currentUser.isAdmin()',
          handler: () => this.handleOpenContentTranslation(),
        });
      }

      actions.push({
        name: i18n.t('menu_permissions', { defaultValue: 'Permissions' }),
        condition_script: 'p.currentUser.isAdmin()',
        as: 'link',
        url: `/permission/view/grid/default?&filter=%60field%60%20%3D%20${field.id}`,
        target: '_blank',
      });
    }

    return (
      <ContextMenu simple model={model} actions={actions}>
        {children}
      </ContextMenu>
    );
  }
}
