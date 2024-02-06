import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { omit, get } from 'lodash/object';
import { compact } from 'lodash/array';
import { some, map } from 'lodash/collection';
import { isEqual } from 'lodash/lang';

import REFERENCE_PROP_TYPES from './prop-types';
import AbstractReference from './abstract';
import RecordDetail from '../../record-detail';
import Modal from './modal';
import RecordCreator from './creator';

const chooserRenderer = (props, onChoose) => () => {
  const { model, view, value, filter, fieldAlias, extra_fields, parent } = props;

  const modalOptions = {
    popup: 'full',
    type: 'reference_view',
    filter,
    extra_fields,
    field: fieldAlias,
  };

  const handleOpenModal = () => {
    PubSub.publish('modal', {
      modelAlias: model,
      viewAlias: view,
      target: 'view',
      options: modalOptions,
      selectable: false,
      onChoose,
      parent,
    });
  }

  return (
    <span>
      <Icon name="search" onClick={handleOpenModal} />
    </span>
  );
};

export const detailRenderer = ({ value, model, disabled, parent }) => (valueIsValid, recordId) => {
  if (!value || !valueIsValid) return;
  if (!recordId) return;

  return (
    <RecordDetail
      parent={parent}
      modelAlias={model}
      recordId={recordId}
      hoverable={!disabled}
      size="large"
    />
  );
};

export const creatorRenderer = (props, sandbox) => () => {
  if (props.disabled) return;
  if (!sandbox.executeScript(`p.currentUser.canCreate('${props.model}')`, {}, `permission/model/script`)) return;

  return <RecordCreator onClick={props.onOpenReferenceCreator} />;
};

const optionsFilter = ({ filter }) => (value) => {
  if (Number(value)) return `id = ${value}`;

  if (value) {
    const query = `\`alias\` = '${value}'`;
    return query;

    // redundant solution (https://redmine.nasctech.com/issues/58284#note-6)
    // ------------------------------------------------------------------------
    // return map(compact([filter, query]), (part) => `(${part})`).join(' AND ');
    // ------------------------------------------------------------------------
  }
}

export const shouldUpdate = (lastProps, nextProps) => {
  const changeableProps = ['config.filter', 'config.foreignModel', 'config.hash', 'fieldName', 'value', 'error', 'required', 'disabled'];

  return some(
    changeableProps,
    (prop) => !isEqual(get(lastProps, prop), get(nextProps, prop))
  );
}

export default class Reference extends Component {
  static propTypes = REFERENCE_PROP_TYPES;

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    return shouldUpdate(this.props, nextProps);
  }

  render() {
    const props = omit(this.props, ['config']);

    props.model = this.props.config.foreignModel;
    props.valuePattern = this.props.config.label;
    props.view = this.props.config.view;
    props.filter = this.props.config.filter;
    props.extra_fields = this.props.config.extra_fields;
    props.parent = this.props.parent;

    return (
      <AbstractReference
        {...props}
        detailRenderer={detailRenderer(props)}
        creatorRenderer={creatorRenderer(props, this.context.sandbox)}
        chooserRenderer={chooserRenderer(props, this.props.onChange)}
        optionsFilter={optionsFilter(props)}
        blankValue={''}
      />
    );
  }
}
