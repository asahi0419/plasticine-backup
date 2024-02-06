import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header, Segment } from 'semantic-ui-react';
import styled from 'styled-components';
import lodash from 'lodash'

import Item from './list-item';

import { DropTarget } from 'react-dnd';
import withDragDropContext from './dnd-context';
import SelectableListFilter from './filter';

const extraFilterOptions = [
  { key: 'all', text: 'All', value: 'all' },
  { key: 'ref', text: 'Ref', value: 'ref' },
  { key: 'rtl', text: 'RTL', value: 'rtl' },
  { key: 'gl_ref', text: 'GlRef', value: 'gl_ref' },
]

const StyledList = styled.div`
  .item {
    &:hover {
      background-color: ${props => props.hovering ? '#eee' : '#fff'} !important;
      cursor: pointer;
    }
    &.active {
      background-color: #eee !important;
      cursor: pointer;
    }
    &.disabled {
      color: #a7a7a7;
    }
  }
`;

const itemTarget = {
  drop({ dropContext }) {
    return {
      name: `${dropContext} ScrollableList`,
      dropContext,
    };
  },
};

@DropTarget('item', itemTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
class ScrollableList extends Component {
  static propTypes = {
    title: PropTypes.string,
    name: PropTypes.string,
    multiple: PropTypes.bool,
    items: PropTypes.array.isRequired,
    activeItems: PropTypes.array,
    showExtraFilter: PropTypes.bool.isRequired,
    onChoose: PropTypes.func.isRequired,
    doubleClick: PropTypes.func,
    dragItem: PropTypes.func,
    height: PropTypes.number,
    pillowed: PropTypes.bool, // with a small clearance at the bottom

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    dropContext: PropTypes.string.isRequired,
    dragItemToContext: PropTypes.func.isRequired,
  }

  static defaultProps = {
    multiple: false,
    pillowed: false,
    height: 300,
    activeItems: [],
    doubleClick: () => null,
    dragItem: () => null,
  };

  state = {
    hovering: true,
    searchTerm: '',
    filteredItems: [],
    extraFilterValue: 'all'
  };

  handleClickItem = (item, e) => {
    // Do not add item many times
    if (e.currentTarget.className.split(/\s+/).includes('active') && e.metaKey) return;

    const activeItems = e.metaKey && this.props.multiple ?
      this.props.activeItems.concat([item]) : [item];
    this.props.onChoose(activeItems);
  }

  handleDoubleClickItem = (item, e) => {
    const activeItems = e.metaKey && this.props.multiple ?
      this.props.activeItems.concat([item]) : [item];
    this.props.onChoose(activeItems);
    this.props.doubleClick();
  }

  handleDragItem = (dragItem, hoverIndex) => {
    const { items } = this.props;
    const itemToDrag = items[dragItem.index];

    if (!items.filter(i => i.value === dragItem.value).length) return;
    this.props.dragItem(dragItem.index, hoverIndex);
  }

  handleDragStart = () => this.setState({ hovering: false })

  handleDragEnd = () => this.setState({ hovering: true })

  handleClearFilter = () => {
    this.setState({
      searchTerm: '',
      filteredItems: [],
      extraFilterValue: 'all'
    })
  }

  handleInputChange = (e, { value }) => {
    this.setState({ searchTerm: value })

    const { items } = this.props
    const { extraFilterValue } = this.state

    if (extraFilterValue === 'all') {
      this.setState({ filteredItems: lodash.filter(items, item => item.text.toLowerCase().includes(value.toLowerCase()) || item.value.includes(value.toLowerCase())) })
    } else {
      const itemsByType = lodash.filter(items, { type: extraFilterValue })
      this.setState({ filteredItems: lodash.filter(itemsByType, item => item.text.toLowerCase().includes(value) || item.value.includes(value)) })
    }
  }

  handleChangeExtraFilter = (e, {value}) => {
    this.setState({
      extraFilterValue: value,
      searchTerm: '',
      filteredItems: value === 'all' ? [] : lodash.filter(this.props.items, { type: value }),
    })
  }

  render() {
    const {
      title,
      height,
      pillowed,
      items,
      activeItems,
      dropContext,
      connectDropTarget,
      dragItemToContext,
      showExtraFilter
    } = this.props;

    const { searchTerm, filteredItems, extraFilterValue } = this.state

    let itemsToRender = items
    if (searchTerm.trim().length || extraFilterValue !== 'all') itemsToRender = filteredItems

    const style = { height: `${height}px`, padding: 0, overflowY: 'auto' };
    if (pillowed) style.marginBottom = '20px';

    return connectDropTarget(
      <div>
        { title ? <Header as="h5">{title}</Header> : '' }
        <SelectableListFilter
          showFilter="true"
          showExtraFilter={showExtraFilter}
          filterOptions={showExtraFilter ? extraFilterOptions : []}
          searchTerm={searchTerm}
          onChange={this.handleInputChange}
          clearFilter={this.handleClearFilter}
          onChangeExtraFilter={this.handleChangeExtraFilter}
        />  
        <Segment className="scrollable-list" style={style}>
          <StyledList hovering={this.state.hovering}>
            {itemsToRender.map((item, index) => {
              const disabled = item.disabled ? 'item disabled' : '';
              const active = activeItems.filter((i) => lodash.isEqual(i.value, item.value)).length ? 'item active' : 'item';

              return (
                <Item
                  key={index}
                  index={index}
                  value={item.value}
                  text={item.text}
                  backgroundColor={item.color || 'transparent'}
                  active={active}
                  disabled={disabled}
                  click={this.handleClickItem.bind(this, item)}
                  doubleClick={this.handleDoubleClickItem.bind(this, item)}
                  dragStart={this.handleDragStart}
                  dragEnd={this.handleDragEnd}
                  dragItem={this.handleDragItem}
                  dragItemToContext={dragItemToContext}
                  dropContext={dropContext}
                />
              );
            })}
          </StyledList>
        </Segment>
      </div>,
    );
  }
}

export default withDragDropContext(ScrollableList);
