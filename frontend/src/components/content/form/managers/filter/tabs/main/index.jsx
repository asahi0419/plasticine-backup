import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { keyBy } from 'lodash/collection';

import * as Field from '../../../../field';
import Filter from './filter';

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
    this.props.onChange({ model: value, query: '' });
  }

  handleApplyFilter = (value) => {
    this.props.onChange({ query: value });
  }

  renderInput = (field, value, onChange) => {
    const Component = Field.getComponent(field.type);
    return <Component field={field} value={value} onChange={onChange} inline={false} />;
  }

  renderFilter = () => {
    return (
      <div style={{ marginTop: '1em' }}>
        <Filter
          record={this.props.record}
          onApply={this.handleApplyFilter}
        />
      </div>
    );
  }

  render() {
    const { record, formFields } = this.props;
    const fieldsByAlias = keyBy(formFields, 'alias');

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.name, record.name, this.handleNameChanged)}
            {this.renderInput(fieldsByAlias.model, +record.model, this.handleModelChanged)}
            {this.renderFilter()}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
