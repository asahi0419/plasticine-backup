import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import REFERENCE_PROP_TYPES from '../reference/prop-types';
import AbstractReference from '../reference/abstract';
import RecordDetail from '../../record-detail';

const chooserRenderer = (props, onChoose) => () => {
  const { model, view, filter, fieldAlias, references, parent } = props;

  const modalOptions = {
    popup: 'full',
    type: 'global_reference_view',
    filter,
    field: fieldAlias,
  };

  const handleOpenModal = () => {
    PubSub.publish('modal', {
      modelAlias: model,
      viewAlias: view,
      target: 'view',
      options: modalOptions,
      selectable: false,
      showModelName: false,
      references: lodash.filter(references, (r) => !lodash.isEmpty(r)),
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

const detailRenderer = ({ value, model, disabled, parent }) => (valueIsValid) => {
  if (!value || !valueIsValid) return;

  return (
    <RecordDetail
      parent={parent}
      modelAlias={model}
      recordId={parseInt(value)}
      hoverable={!disabled}
      size="large"
    />
  );
};

const optionsFilter = ({ filter }) => (value) => {
  if (value) {
    const query = `\`id\` = ${value}`;
    return query;

    // redundant solution (https://redmine.nasctech.com/issues/58284#note-6)
    // ------------------------------------------------------------------------
    // return map(compact([filter, query]), (part) => `(${part})`).join(' AND ');
    // ------------------------------------------------------------------------
  }
}

export default class GlobalReference extends Component {
  static propTypes = {
    ...REFERENCE_PROP_TYPES,
    config: PropTypes.shape({
      foreignModel: PropTypes.string,
      references: PropTypes.array,
    }),
  }

  constructor(props) {
    super(props);

    this.state = { reference: this.getReference(props) };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ reference: this.getReference(nextProps) });
  }

  getReference = (props) => {
    const { config = {} } = props;
    const { references = [], foreignModel: model } = config;
    const { label = 'id', filter } = lodash.find(references, { model }) || {};

    return { label, filter, model };
  }

  onChoose = (e, { record }, reference) => {
    this.setState({ reference });
    this.props.onChange(e, { value: { id: record.id, model: reference.model }, record });
  }

  render() {
    const props = lodash.omit(this.props, ['config']);
    const { reference } = this.state;

    props.model = reference.model;
    props.valuePattern = reference.label;
    props.filter = reference.filter;
    props.references = this.props.config.references;
    props.parent = this.props.parent;

    return (
      <AbstractReference
        {...props}
        searchable={false}
        detailRenderer={detailRenderer(props)}
        chooserRenderer={chooserRenderer(props, this.onChoose)}
        optionsFilter={optionsFilter(props)}
        blankValue={null}
      />
    );
  }
}
