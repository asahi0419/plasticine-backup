import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';

import * as HELPERS from '../../../../../../../helpers';

export default class FieldElement extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  }

  renderValue = () => {
    const { record, field, params: { max_length, suppress_click }} = this.props;

    let isValueMissed = false;
    let value = record.getVisible(field.alias);

    if (!value) {
      isValueMissed = true;
      value = record.get(field.alias) || '';
    }

    value = value.toString();

    if (max_length && value.length > max_length) {
      value = value.substring(0, max_length) + '...';
    }

    if (value && field.type == 'fa_icon') return <Icon name={value} />;
    if (field.type !== 'reference' || suppress_click) return value;

    const { foreign_model } = HELPERS.parseOptions(field.options);

    const style = {
      color: isValueMissed ? '#db2828' : 'inherit',
      textDecoration: 'underline',
      textDecorationColor: isValueMissed ? '#db2828' : 'inherit',
    };

    return (
      <Link style={style} target="_blank" to={`/${foreign_model}/form/${record.get(field.alias)}`}>
        {value}
      </Link>
    );
  }

  render() {
    const { field, params: { label, show_label = false }} = this.props;

    return (
      <div>
        {show_label && <strong>{label || field.name}: </strong>}
        {this.renderValue()}
      </div>
    );
  }
}
