import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Section from './section';

import Styles from '../styles';
import elementFactory from './element';

const ItemStyled = styled.div`
  position: relative;
  padding: 2px;
  background-color: transparent;
  border-radius: .2571429rem;
  overflow: hidden;
`;

export default class Item extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    layout: PropTypes.object.isRequired,
    actions: PropTypes.array.isRequired,
    styles: PropTypes.object.isRequired,
    handleAction: PropTypes.func.isRequired,
    selected: PropTypes.bool,
  }

  renderSection = (section, i) => {
    return (
      <Section
        key={i}
        styles={this.props.styles.mergeWith(Styles.initFromParams(section.params || {}))}
        params={section}
        componentRenderer={this.renderComponent}
      />
    );
  }

  renderComponent = (component, parentStyles) => {
    return elementFactory(component, parentStyles, this.props);
  }

  render() {
    const { layout, selected } = this.props;

    return (
      <ItemStyled className={selected && 'selected'}>
        {layout.sections.map(this.renderSection)}
      </ItemStyled>
    );
  }
}
