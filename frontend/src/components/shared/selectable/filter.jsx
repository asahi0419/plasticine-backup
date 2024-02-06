import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Input, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledChooserFilter = styled.div`
  display: flex;
  justify-content: space-between;

  .ui.icon.input {
    font-size: 1em;
    height: 32px;
  }

  .ui.basic.button.floating.dropdown {
    max-width: 60px;
    min-width: 60px;
    height: 32px;
    padding: 9px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;

    i.dropdown.icon {
      width: auto;
      margin-left: 5px;
    }
  }
`;

export default class SelectableListFilter extends Component {
  static propTypes = {
    props: PropTypes.shape({
      items: PropTypes.array.isRequired,
      showFilter: PropTypes.bool,
      showExtraFilter: PropTypes.bool.isRequired,
      searchTerm: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
      clearFilter: PropTypes.func.isRequired,
      filterOptions: PropTypes.array,
      onChangeExtraFilter: PropTypes.func.isRequired,
    }),
  }

  constructor(props) {
    super(props);

    this.state = {
      filteredItems: [],
      searchTerm: '',
    };
  }

  renderDropdown() {
    const { filterOptions, onChangeExtraFilter, showExtraFilter } = this.props
    if (showExtraFilter === false) return
    
    return (
      <Dropdown closeOnChange button basic floating options={filterOptions} defaultValue='all' onChange={onChangeExtraFilter} />
    )
  } 

  renderInput() {
    const { searchTerm, onChange, showExtraFilter } = this.props;
    const style = showExtraFilter ? { marginRight: '5px' } : { width: '100%' }
    
    return (
      <Input
        icon={{
          name: 'close icon',
          onClick: this.props.clearFilter,
          link: true
        }}
        style={style}
        value={searchTerm}
        placeholder="Filter..."
        onChange={onChange}
      />
    );
  }

  render() {
    const { showFilter } = this.props

    if (showFilter === 'false') return

    return (
      <StyledChooserFilter className="selectable-list-filter">
        {this.renderInput()}
        {this.renderDropdown()}
      </StyledChooserFilter>
    );
  }
}
