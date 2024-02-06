import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { keyBy } from 'lodash/collection';

import * as Field from '../../../../field';
import GridRules from './grid-rules';

export default class MainTab extends React.Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleNameChanged = (e, { value }) => {
    this.props.onChange({ name: value })
  }

  handleModelChanged = (e, { value }) => {
    this.props.onChange({ model: value });
  }

  handleTypeChanged = (e, { value }) => {
    this.props.onChange({ type: value, options: null })
  }

  handleScriptChanged = (e, { value }) => {
    this.props.onChange({ script: value })
  }

  handleOptionsChanged = (e, { value }) => {
    this.props.onChange({ options: value })
  }

  handleDrawingChanged = (e, { value }) => {
    this.props.onChange({ drawing: value })
  }

  renderInput = (field, value, onChange) => {
    const Component = Field.getComponent(field.type);
    return <Component field={field} value={value} onChange={onChange} inline={false} />;
  }

  renderGridRules = () => {
    const { record, onChange } = this.props;

    if (!record.model) return;

    return (
      <GridRules
        record={record}
        onChange={onChange}
      />
    );
  }

  render() {
    const { record, formFields } = this.props;
    const fieldsByAlias = keyBy(formFields, 'alias');
    const isScriptVisible = ['map', 'calendar', 'topology'].includes(record.type);
    const isOptionsVisible = isScriptVisible;

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.name, record.name, this.handleNameChanged)}
            {this.renderInput(fieldsByAlias.model, +record.model, this.handleModelChanged)}
            {this.renderInput(fieldsByAlias.type, record.type, this.handleTypeChanged)}
            {isScriptVisible && this.renderInput(fieldsByAlias.script, record.script, this.handleScriptChanged)}
            {isOptionsVisible && this.renderInput(fieldsByAlias.options, record.options, this.handleOptionsChanged)}
            {record.type === 'map' && this.renderInput(fieldsByAlias.drawing, record.drawing, this.handleDrawingChanged)}
            {record.type === 'grid' && this.renderGridRules()}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
