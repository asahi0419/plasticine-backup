import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Button } from 'semantic-ui-react';

import RadioTable from '../../../../../shared/tables/radio';

export default class SortingTab extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleSortingChanged = (data) => this.props.onChange({ options: { ...this.props.record.options, sort_order: data } });

  handleResetSortingClicked = (e) => {
    e.preventDefault();
    const sorting = this.props.record.options.sort_order.map((order) => Object.assign({}, order, { type: 'none' }));
    this.props.onChange({ options: { ...this.props.record.options, sort_order: sorting } });
  }

  render() {
    const { record: { type = 'grid', options = {} } } = this.props;
    const { sort_order = [] } = options;

    const sorting = sort_order.filter((order = {}) => {
      if (type === 'grid') {
        return (options.columns || []).includes(order.field);
      }

      if (type === 'card') {
        return ((options.components || {}).list || []).includes(order.field);
      }
    });

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <RadioTable items={sorting} onChange={this.handleSortingChanged}>
              <RadioTable.Column label={i18n.t('field_name', { defaultValue: 'Field name' })} valueKey="field" />
              <RadioTable.Column label={i18n.t('none', { defaultValue: 'None' })} valueKey="type" value="none" checker={{ type: 'none' }} />
              <RadioTable.Column label={i18n.t('asc', { defaultValue: 'Asc' })} valueKey="type" value="ascending" checker={{ type: 'ascending' }} />
              <RadioTable.Column label={i18n.t('desc', { defaultValue: 'Desc' })} valueKey="type" value="descending" checker={{ type: 'descending' }} />
            </RadioTable>
            <Button basic onClick={this.handleResetSortingClicked}>{i18n.t('reset', { defaultValue: 'Reset' })}</Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
