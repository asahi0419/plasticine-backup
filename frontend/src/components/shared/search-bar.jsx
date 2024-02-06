import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import * as CONSTANTS from '../../constants';

const SearchBarStyled = styled.div`
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  border-radius: 0;

  .input {
    padding: 5px 51px 4px 10px;
    border: none !important;
  }

  input {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .search-bar-controls {
    position: absolute;
    top: -1px;
    right: 5px;
    display: flex;
    height: 100%;
    align-items: center;

    .icon {
      cursor: pointer;
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    height: 32px !important;

    .input {
      height: 32px !important;
      padding: 5px 51px 8px 10px;
    }
  }
`;

export default class SearchBar extends Component {
  static propTypes = {
    style: PropTypes.object,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
  }

  static defaultProps = {
    style: {},
    value: '',
    placeholder: 'Search ...',
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keydownHandler);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keydownHandler);
  }

  keydownHandler = (e) => {
    // CTRL + SHIFT + F
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 70)) this.focusInput();
  }

  handleChange = (_, { value }) => {
    this.props.onSearch(value);
  }

  clearSearch = () => {
    this.props.onSearch('');
  }

  focusInput = () => {
    this.inputElement.focus();
  }

  renderInput() {
    const { value, placeholder, style } = this.props;
    const { height = '28px' } = style;

    return (
      <Input
        transparent
        value={value}
        style={{ height, width: '100%' }}
        placeholder={placeholder}
        onChange={this.handleChange}
        ref={(input) => this.inputElement = input}
      />
    );
  }

  renderControls() {
    return (
      <div className="search-bar-controls">
        <Icon name="search" onClick={this.focusInput} />
        <Icon name="remove" onClick={this.clearSearch} />
      </div>
    );
  }

  render() {
    return (
      <SearchBarStyled className="search-bar" style={this.props.style}>
        {this.renderInput()}
        {this.renderControls()}
      </SearchBarStyled>
    );
  }
}
