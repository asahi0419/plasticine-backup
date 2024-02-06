import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';

import PlasticineApi from '../../../api';

const DropdownStyled = styled(Dropdown)`
  &::after {
    content: '\\F0D7';
    font-family: Dropdown;
    position: absolute;
    right: 9px;
    top: 7px;
  }

  .item .text {
    margin: 0 !important;
  }

  > .icon {
    margin: 0 0 0 3px;
    position: relative !important;
    width: initial !important;
    height: initial !important;
    line-height: initial !important;
    top: 0 !important;
    right: 0 !important;
    margin: 0 0 0 3px !important;
    padding: 0 !important;
    opacity: 1 !important;
  }
`;

export default class FAIcon extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      icons: [],
      visibleOptions: this.buildVisibleOptions([], props.value),
    };
  }

  componentDidMount() {
    this.fetchOptions();
  }

  fetchOptions = () => {
    const { value } = this.props;

    PlasticineApi.loadFAIcons()
      .then(({ data: icons }) => {
        this.setState({ icons, visibleOptions: this.buildVisibleOptions(icons, value) });
      });
  }

  buildVisibleOptions(icons, selectedValue) {
    const result = [
      { text: `-- ${i18n.t('none', { defaultValue: 'None' })} --`, value: 'none', key: 'none' },
    ];

    if (selectedValue && selectedValue !== 'none') {
      result.push({ text: 'FA Icon —', value: selectedValue, icon: selectedValue, key: 'selected' });
    }

    const firstOptions = icons.slice(0, 10).map((icon, i) => ({ text: icon, value: icon, icon, key: i }));

    return result.concat(firstOptions)
                 .concat({ text: 'type some keyword to find more icons', disabled: true, key: 'more' });
  }

  onChange = (e, { value }) => {
    if (value === 'none') {
      this.setState({ visibleOptions: this.buildVisibleOptions(this.state.icons, value) });
      value = null;
    }

    this.props.onChange(e, { value });
  }

  onSearchChange = (e, { searchQuery }) => {
    const foundIcons = [];

    for (let icon of this.state.icons) {
      if (foundIcons.length === 10) break;

      if (RegExp(`${searchQuery}`,'g').test(icon)) {
        foundIcons.push(icon)
      }
    }

    this.setState({ visibleOptions: this.buildVisibleOptions(foundIcons, this.props.value) });
  }

  render() {
    const { value } = this.props;
    const { visibleOptions } = this.state;

    return (
      <DropdownStyled
        selection
        search
        value={value || 'none'}
        icon={value}
        options={visibleOptions}
        onChange={this.onChange}
        onSearchChange={this.onSearchChange}
      />
    );
  }
}
