import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { keyBy } from 'lodash/collection';

import * as Field from '../../../field';

import GridComponentsManager from './components-managers/grid';
import CardComponentsManager from './components-managers/card';

const DEFAULT_GRID_OPTIONS = { columns: [], columns_options: {}, sort_order: [], wrap_text: true, no_wrap_text_limit: 50 };
const DEFAULT_CARD_OPTIONS = {
  components: { options: {}, list: [] },
  sort_order: [],
  card_style: {
    width: 300,
    margin: 20,
    font_size: 1,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '{ 0, 0, 0, 0 }',
    border: false,
    border_width: 1,
    border_color: 'rgba(0, 0, 0, 1)',
    background_color: 'rgba(255, 255, 255, 1)',
    show_as_carousel: false,
  }
};

const MANAGERS = {
  grid: GridComponentsManager,
  card: CardComponentsManager,
};

export default class MainTab extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    record: PropTypes.object.isRequired,
    formFields: PropTypes.array,
    onChange: PropTypes.func.isRequired,
  }

  handleNameChanged = (e, { value }) => {
    this.props.onChange({ name: value });
  }
  handleTypeChanged = (e, { value }) => {
    this.props.onChange({ type: value, options: { grid: DEFAULT_GRID_OPTIONS, card: DEFAULT_CARD_OPTIONS }[value] });
  }
  handleModelChanged = (e, { value }) => {
    this.props.onChange({ model: value });
  }

  renderInput = (field, value, onChange, props) => {
    const Component = Field.getComponent(field.type);
    return (
      <div style={{ marginBottom: '1em' }}>
        <Component
          field={field}
          value={value}
          onChange={onChange}
          inline={false}
          {...props}
        />
      </div>
    );
  }

  render() {
    const { record, formFields, onChange, type } = this.props;

    const fieldsByAlias = keyBy(formFields, 'alias');
    const Manager = MANAGERS[record.type];

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {type !== 'user_setting' && this.renderInput(fieldsByAlias.name, record.name, this.handleNameChanged)}
            {type !== 'user_setting' && this.renderInput(fieldsByAlias.model, record.model, this.handleModelChanged)}
            {type !== 'user_setting' && this.renderInput(fieldsByAlias.type, record.type, this.handleTypeChanged)}
          </Grid.Column>
        </Grid.Row>
        {record.model && Manager && (
          <Manager
            record={record}
            onChange={onChange}
          />
        )}
      </Grid>
    );
  }
}
