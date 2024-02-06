import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash/collection';
import { omit } from 'lodash/object';
import { compact } from 'lodash/array';
import { Icon } from 'semantic-ui-react';

import { shouldUpdate, creatorRenderer } from '../reference';
import REFERENCE_PROP_TYPES from '../reference/prop-types';
import AbstractReference from '../reference/abstract';

const optionsFilter = ({ filter }) => (value) => {
  if (value.length) {
    const query = `\`id\` IN (${value.join(',')})`;
    return query;

    // redundant solution (https://redmine.nasctech.com/issues/58284#note-6)
    // ------------------------------------------------------------------------
    // return map(compact([filter, query]), (part) => `(${part})`).join(' AND ');
    // ------------------------------------------------------------------------
  }
};

const chooserRenderer = (props) => () => {
  const { model, view, value, filter, fieldAlias, parent } = props;

  const modalOptions = {
    popup: 'full',
    type: 'rtl_popup',
    selectedRecords: value || [],
    filter,
    field: fieldAlias,
    onChange: ((value) => props.onChange(null, { value })),
  };
  const handleOpenModal = () => {
    PubSub.publish('modal', {
      modelAlias: model,
      viewAlias: view,
      target: 'view',
      rowselect: true,
      options: modalOptions,
      parent,
    });
  }

  return (
    <span>
      <Icon name="search" onClick={handleOpenModal} />
    </span>
  );
};

export default class ReferenceToList extends Component {
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
    props.parent = this.props.parent;
    props.multiple = true;

    return (
      <AbstractReference
        {...props}
        chooserRenderer={chooserRenderer(props)}
        creatorRenderer={creatorRenderer(props, this.context.sandbox)}
        optionsFilter={optionsFilter(props)}
        blankValue={[]}
      />
    );
  }
}
