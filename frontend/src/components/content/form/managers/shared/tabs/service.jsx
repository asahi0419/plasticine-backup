import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { keyBy } from 'lodash/collection';

import * as Field from '../../../field';

export default class ServiceTab extends React.Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array.isRequired,
  }

  renderInput = (field, value, onChange) => {
    const Component = Field.getComponent(field.type);
    return <Component field={field} value={value} onChange={onChange} disabled inline={false} />;
  }

  render() {
    const { record, formFields } = this.props;
    const fieldsByAlias = keyBy(formFields, 'alias');

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.id, record.id, () => null)}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.created_at, record.created_at, () => null)}
            {this.renderInput(fieldsByAlias.updated_at, record.updated_at, () => null)}
          </Grid.Column>
          <Grid.Column>
            {this.renderInput(fieldsByAlias.created_by, record.created_by, () => null)}
            {this.renderInput(fieldsByAlias.updated_by, record.updated_by, () => null)}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
