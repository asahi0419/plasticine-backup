import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Styles from './styles';
import Item from './item/container';

export default class Grid extends Component {
  static propTypes = {
    layout: PropTypes.object.isRequired,
    records: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    actions: PropTypes.array.isRequired,
    view: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired,
  }

  render() {
    const { model, actions, fields, records, handleAction, view, layout: { card_style, components } } = this.props;

    const cardStyles = Styles.initFromParams(card_style);
    const { width, margin } = cardStyles.getCSSRules(['width', 'margin']);

    const containerStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginRight: `-${margin}`,
      marginBottom: `-${margin}`,
    };

    return (
      <div style={containerStyle}>
        {records.map((record, i) =>
          <div style={{ width, marginBottom: margin, marginRight: margin }} key={i}>
            <Item
              model={model}
              fields={fields}
              actions={actions}
              layout={components}
              styles={cardStyles}
              record={record}
              handleAction={handleAction}
              view={view}
            />
          </div>
        )}
      </div>
    );
  }
}
