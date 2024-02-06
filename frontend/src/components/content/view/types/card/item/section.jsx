import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Styles from '../styles';

const SectionTable = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;

  &:not(:last-child) {
    margin-bottom: ${({ border, borderWidth }) => border ? `-${borderWidth}px;` : '0;'}
  }
`;

const Cell = styled.td`
  padding: 0;
`;

export default class Section extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    styles: PropTypes.object.isRequired,
    componentRenderer: PropTypes.func.isRequired,
  }

  renderCell = (component, parentStyles) => {
    const { componentRenderer } = this.props;
    const styles = parentStyles.mergeWith(Styles.initFromParams(component.params || {}));
    const cellStyles = {
      wordBreak: 'break-word',
      ...styles.getCSSRules(['width', 'minWidth', 'backgroundColor', 'border', 'color', 'fontSize', 'textAlign'])
    };

    return (
      <Cell
        key={component.id}
        style={cellStyles}
        rowSpan={component.params.rowspan}
      >
        <div style={{ ...styles.getCSSRules(['padding']), minHeight: '20px' }}>
          {componentRenderer(component, parentStyles)}
        </div>
      </Cell>
    );
  }

  renderHeader = (numberOfColumns) => {
    const { params = {} } = this.props.params;

    if (params.name) {
      return <thead><tr><th colSpan={numberOfColumns}>{params.name}</th></tr></thead>;
    }
  }

  render() {
    const { styles, params: { columns, table }} = this.props;
    const widthOfColumn = 100 / columns.length;

    const columnsStyles = columns.map(({ params = {} }) => {
      const columnStyles = styles.mergeWith(Styles.initFromParams(params));
      columnStyles.styles.width = widthOfColumn; // dirty injecting
      return columnStyles;
    });

    return (
      <SectionTable {...styles.styles} style={styles.getCSSRules(['border'])}>
        {this.renderHeader(table[0].length)}
        <tbody>
          {table.map((row, i) =>
            <tr key={i}>
              {row.map((component, y) =>
                component && this.renderCell(component, columnsStyles[y])
              )}
            </tr>
          )}
        </tbody>
      </SectionTable>
    );
  }
}
