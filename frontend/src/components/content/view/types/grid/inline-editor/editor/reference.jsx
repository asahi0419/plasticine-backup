import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import * as HELPERS from '../../../../../../../helpers';

import BaseEditor from './base';
import * as Field from '../../../../../form/field';

const EditorInputStyled = styled.div`
  display: inline-block;
  margin-right: 7px;

  .reference-field {
    min-width: 180px;

    &:last-child {
      margin-bottom: 0;
    }
    .dropdown {
      width: auto;
    }
    .record-detail {
      display: none;
    }
    label {
      margin-right: 0 !important;
      margin-left: 5px !important;
    }
  }

  &.single-input {
    .input {
      label {
        display: none !important;
      }
      .controls {
        top: 7px !important;
      }
    }
  }
`;

export default class ReferenceEditor extends BaseEditor {
  static propTypes = {
    ...BaseEditor.propTypes,
    fields: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { value: props.value, references: this.getReferences() };
  }

  getReferences = () => {
    const { record, column } = this.props;
    const depends_on = HELPERS.parseOptions(column.options).depends_on || [];
    const references = [{ alias: column.alias, value: record[column.alias] }];

    this.spreadReferenceDependencies(references, depends_on);
    references.reverse();
    this.spreadDependingOnReference(references, column.alias);

    return references;
  }

  spreadDependingOnReference = (references, alias) => {
    const { fields, record } = this.props;
    const dependentFields = fields.filter(({ type, options }) => {
      const depends_on = HELPERS.parseOptions(options).depends_on || [];
      return type === 'reference' && depends_on.includes(alias);
    });

    dependentFields.forEach((field) => {
      references.push({ alias: field.alias, value: record[field.alias] });
      this.spreadDependingOnReference(references, field.alias);
    });
  }

  spreadReferenceDependencies = (references, aliases = []) => {
    const { record, fields } = this.props;
    const dependentFields = fields.filter(({ alias }) => aliases.includes(alias));

    dependentFields.forEach((field) => {
      references.push({ alias: field.alias, value: record[field.alias] });
      const depends_on = HELPERS.parseOptions(field.options).depends_on || [];
      this.spreadReferenceDependencies(references, depends_on);
    });
  }

  handleInputChange = (e, { value }, i) => {
    const references = [ ...this.state.references ];
    const targetReference = references[i];

    targetReference.value = value;
    references.forEach((reference, j) => {
      if (references[j] && (j > i)) references[j].value = null;
    });

    this.setState({ references });
  }

  handleApplyValue = () => {
    const attrs = {};
    this.state.references.forEach(({ alias, value }) => attrs[alias] = value);
    this.props.onApply(attrs);
    this.handleClose();
  }

  getRecordValue = (fieldAlias) => {
    const { record } = this.props;
    const reference = this.state.references.find(({ alias }) => alias === fieldAlias);
    return reference ? reference.value : record[fieldAlias];
  }

  getHumanizedValue = (fieldAlias) => {
    const { record } = this.props;
    const { __metadata: { human_attributes } } = record;

    if (this.getRecordValue(fieldAlias) !== record[fieldAlias]) return;
    return human_attributes[fieldAlias];
  }


  renderReferences() {
    return this.state.references.map((reference, i) => {
      const field = this.props.fields.find(({ alias }) => alias === reference.alias);
      const Component = Field.getComponent('reference');

      return (
        <Component
          key={i}
          showRecordDetail={false}
          onOpenReferenceCreator={_ => {}}
          field={field}
          value={reference.value}
          humanizedValue={this.getHumanizedValue(field.alias)}
          inline={false}
          onChange={(e, { value }) => this.handleInputChange(e, { value }, i)}
          getRecordValue={this.getRecordValue}
        />
      );
    });
  }

  renderInput() {
    const className = this.state.references.length > 1 ? 'ui form' : 'ui form single-input';
    return <EditorInputStyled className={className}>{this.renderReferences()}</EditorInputStyled>;
  }
}
