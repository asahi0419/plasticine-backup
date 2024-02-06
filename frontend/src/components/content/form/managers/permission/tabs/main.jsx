import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { keyBy } from 'lodash/collection';

import { parseOptions } from '../../../../../../helpers';

import * as Field from '../../../field';
import Filter from '../../../../../shared/filter';

export default class MainTab extends React.Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array.isRequired,
    fields: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    fetchVariables: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { record, fetchVariables } = this.props;
    if (!record.id && record.model) fetchVariables({ ...record, record_id: record.id });
  }

  handleModelChanged = (_, { value }) => {
    const { record, onChange, fetchVariables } = this.props;

    onChange({ model: value, field: null });
    fetchVariables({ ...record, record_id: record.id, modelId: value });
  }
  handleTypeChanged = (_, { value }) => this.props.onChange({ action: null, script: '', type: value })
  handleActionChanged = (_, { value }) => this.props.onChange({ script: '', action: value })
  handleFieldChanged = (_, { value }) => this.props.onChange({ script: '', field: value })
  handleApplyFilter = (value) => this.props.onChange({ script: value })
  handleScriptChanged = (_, { value }) => this.props.onChange({ script: value })

  renderFilter = () => {
    const { record, fields } = this.props;
    const model = Object.assign({}, this.props.model, { id: record.model } );

    return (
      <Filter
        model={model}
        filter={record.script}
        fields={fields}
        onApply={this.handleApplyFilter}
      />
    );
  }

  renderInput = (field, value, onChange) => {
    const { record, fields } = this.props;

    const Component = Field.getComponent(field.type);
    const getRecordValue = (alias) => record[alias];

    return (
      <Component
        field={field}
        fields={fields}
        value={value}
        onChange={onChange}
        getRecordValue={getRecordValue}
        inline={false}
      />
    );
  }

  render() {
    const { record, formFields } = this.props;
    const fieldsByAlias = keyBy(formFields, 'alias');

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.model, +record.model, this.handleModelChanged)}
            {this.renderInput(fieldsByAlias.type, record.type, this.handleTypeChanged)}
            {this.renderInput(fieldsByAlias.action, record.action, this.handleActionChanged)}
            {(record.type === 'field') &&
              this.renderInput(fieldsByAlias.field, record.field, this.handleFieldChanged)}
            {(record.action === 'query')
              ? this.renderFilter()
              : this.renderInput(fieldsByAlias.script, record.script, this.handleScriptChanged)}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
