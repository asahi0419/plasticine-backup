import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { keyBy } from 'lodash/collection';

import * as Field from '../../../field';

import ComponentsManager from './components-manager';

export default class MainTab extends React.Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array,
    onChange: PropTypes.func.isRequired,
  }

  handleChange = (alias) => (_, { value }) => this.props.onChange({ [alias]: value })

  renderInput = (field, value) => {
    const Component = Field.getComponent(field.type);

    return (
      <div style={{ marginBottom: '1em' }}>
        <Component
          field={field}
          value={value}
          onChange={this.handleChange(field.alias)}
          inline={false}
        />
      </div>
    );
  }

  render() {
    const { record, formFields, onChange } = this.props;
    const { name, alias, order, active, condition_script } = record;
    const fieldsByAlias = keyBy(formFields, 'alias');

    return (
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.name, name)}
            {this.renderInput(fieldsByAlias.order, order)}
          </Grid.Column>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.alias, alias)}
            {this.renderInput(fieldsByAlias.active, active)}
          </Grid.Column>
        </Grid.Row>
        <ComponentsManager record={record} onChange={onChange} />
        <Grid.Row>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.condition_script, condition_script)}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
