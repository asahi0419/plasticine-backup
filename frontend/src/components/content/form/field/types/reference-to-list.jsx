import React from 'react';
import PropTypes from 'prop-types';
import { each, sortBy } from 'lodash/collection';
import { isNull, isEqual } from 'lodash/lang';

import Messenger from '../../../../../messenger';
import ReferenceField from './reference';
import ReferenceToList from '../../../../shared/inputs/reference-to-list';
import ReferenceToListTree from '../../../../shared/inputs/reference-to-list/tree';

import { parseOptions } from '../../../../../helpers';

export default class ReferenceToListField extends ReferenceField {
  static propTypes = {
    ...ReferenceField.propTypes,
    limit: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.options = parseOptions(props.field.options);
    this.state = { value: props.value || [] };
  }

  componentWillReceiveProps(nextProps) {
    this.options = parseOptions(nextProps.field.options);

    if (!isEqual(sortBy(nextProps.value || []), sortBy(this.state.value))) {
      this.setState({ value: nextProps.value });
    }
  }

  onChange = (e, { value }) => {
    const { limit } = this.props;

    if ((this.options.visualization !== 'treeview') && (value.length > limit)) {
      Messenger.error({ content: i18n.t('field_rtl_select_limit', { defaultValue: `Items visualization limit is reached (${limit})`, limit: limit }) });
      return
    }

    this.props.onChange(e, { value });
  }

  getOptions = () => {
    const { humanizedValue = [], forceLoad, isFieldChanged } = this.props;
    const { value } = this.state;

    const options = [];
    if (!forceLoad && !isFieldChanged) {
      each(value, (v, i) => {
        const text = humanizedValue[i] || v;
        const option = { value: v, text };

        if (isNull(humanizedValue[i])) option.className = 'not-valid';
        options.push(option);
      });
    }
    return options;
  }

  renderTree() {
    const { enabled, inline } = this.props;
    const { tree, foreignModel } = this.generateConfig(this.options);

    const value = this.state.value;
    const label = this.renderLabel();
    const options = this.getOptions();

    return (
      <ReferenceToListTree
        model={foreignModel}
        tree={tree}
        name={label}
        value={value}
        inline={inline}
        disabled={!enabled}
        onChange={this.onChange}
      />
    );
  }

  renderInput() {
    const { enabled, required, inline, error, parent,
            showReferenceCreator, onOpenReferenceCreator,
            field } = this.props;

    const value = this.state.value;
    const label = this.renderLabel();
    const options = this.getOptions();
    const config = this.generateConfig(this.options, field.type);
    return (
      <ReferenceToList
        fieldName={field.name}
        fieldAlias={field.alias}
        config={config}
        parent={parent}
        name={label}
        value={value}
        options={options}
        inline={inline}
        error={error}
        disabled={!enabled}
        required={required}
        onChange={this.onChange}
        setValue={this.setValue}
        setVisibleValue={this.setVisibleValue}
        showReferenceCreator={showReferenceCreator}
        onOpenReferenceCreator={onOpenReferenceCreator}
      />
    );
  }

  render() {
    return (this.options.visualization === 'treeview')
      ? this.renderTree()
      : this.renderInput();
  }
}
