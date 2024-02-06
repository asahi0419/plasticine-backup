import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'semantic-ui-react';
import { isEqual } from 'lodash/lang';
import { findIndex, uniqBy } from 'lodash/array';
import { sortBy } from 'lodash/collection';

import { makeUniqueID } from '../../../helpers';
import ScrollableList from './scrollable-list';

const isItemsEqual = (left, right) => {
  return isEqual(left.map((item) => item.value), right.map((item) => item.value));
};

const fixValueOfUniqItems = (items) => {
  return items.map((item) => {
    if (!item.uniqueValue) return item;
    return Object.assign({}, item, { value: `${item.value}.${makeUniqueID()}` });
  });
};

class DoubleSidedSelect extends Component {
  static propTypes = {
    leftSideLabel: PropTypes.string,
    rightSideLabel: PropTypes.string,
    items: PropTypes.array.isRequired,
    selected: PropTypes.array,
    onChange: PropTypes.func,
    onClickSelectedItem: PropTypes.func,
    showExtraFilter: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    availableItems: [],
    selected: [],
  };

  constructor(props) {
    super(props);
    this.state = this.mapPropsToState(props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isItemsEqual(this.state.availableItems, this.sortItems(nextProps.items)) ||
        !isItemsEqual(this.state.selectedItems, nextProps.selected)) {
      this.setState(this.mapPropsToState(nextProps));
    }
  }

  mapPropsToState(props) {
    return {
      availableItems: this.sortItems(props.items),
      activeAvailableItems: props.items.length ? [ props.items[0] ] : [],
      selectedItems: props.selected,
      activeSelectedItems: props.selected.length ? [ props.selected[0] ] : [],
    };
  }

  handlePropagate() {
    if (this.props.onChange) {
      this.props.onChange(this.state.selectedItems);
    }
  }

  handleChooseAvailableItems = (items) => {
    this.setState({ activeAvailableItems: items });
  }

  handleChooseSelectedItems = (items) => {
    this.setState({ activeSelectedItems: items }, () => {
      if (this.props.onClickSelectedItem) this.props.onClickSelectedItem(items[0]);
    });
  }

  sortItems = (items) => {
    return sortBy(items, ['position', 'value']);
  }

  handleSelectItem = () => {
    const {
      activeAvailableItems: _activeAvailableItems,
      activeSelectedItems: _activeSelectedItems,
      availableItems: _availableItems,
      selectedItems: _selectedItems,
    } = this.state;

    let activeAvailableItems

    if (_availableItems.indexOf(_activeAvailableItems[0]) === 0) {
      activeAvailableItems = [ _availableItems[_availableItems.indexOf(_activeAvailableItems[0]) + 1] ]
    } else {
      activeAvailableItems = [ _availableItems[_availableItems.indexOf(_activeAvailableItems[0]) - 1] ]
    }

    if (_activeAvailableItems[0].value.includes('__')) activeAvailableItems = [];

    if (_activeAvailableItems[0].value.includes('__')) {
      activeAvailableItems = [ _availableItems[_availableItems.indexOf(_activeAvailableItems[0])] ];
    } else if (_availableItems.indexOf(_activeAvailableItems[0]) === 0) {
      activeAvailableItems = [ _availableItems[_availableItems.indexOf(_activeAvailableItems[0]) + 1] ];
    } else {
      activeAvailableItems = [ _availableItems[_availableItems.indexOf(_activeAvailableItems[0]) - 1] ];
    }

    if (_availableItems.length === 1) activeAvailableItems = [];

    let activeSelectedItems

    if (_activeSelectedItems.length === 0) {
      activeSelectedItems = _activeSelectedItems.concat(_activeAvailableItems);
    } else {
      activeSelectedItems = _activeAvailableItems;
    }

    let availableItems = _availableItems
    if (!_activeAvailableItems[0].value.includes('__')) {
      availableItems = _availableItems.filter((item) => !_activeAvailableItems.includes(item))
    }

    const selectedItems = _selectedItems.concat(fixValueOfUniqItems(_activeAvailableItems));

    this.setState({
      activeAvailableItems,
      activeSelectedItems,
      availableItems,
      selectedItems,
    }, this.handlePropagate);
  }

  handleDeselectItem = () => {
    const {
      activeAvailableItems: _activeAvailableItems,
      activeSelectedItems: _activeSelectedItems,
      availableItems: _availableItems,
      selectedItems: _selectedItems,
    } = this.state;

    let activeSelectedItems
    if (_selectedItems.indexOf(_activeSelectedItems[0]) === 0) {
      activeSelectedItems = [ _selectedItems[_selectedItems.indexOf(_activeSelectedItems[0]) + 1] ]
    } else {
      [ _selectedItems[_selectedItems.indexOf(_activeSelectedItems[0]) - 1] ]
    }

    if (_selectedItems.length === 1) activeSelectedItems = []

    let activeAvailableItems = _activeSelectedItems;
    if (_activeAvailableItems.length === 0) {
      activeAvailableItems = _activeAvailableItems.concat(_activeSelectedItems);
    }

    const availableItems = uniqBy(_availableItems.concat(_activeSelectedItems), 'text');
    const selectedItems = _selectedItems.filter((item) => !_activeSelectedItems.includes(item));

    this.setState({
      activeAvailableItems,
      activeSelectedItems: [],
      availableItems,
      selectedItems,
    }, this.handlePropagate);
  }

  handleSelectAll = () => {
    const { availableItems, selectedItems } = this.state;

    let activeSelectedItems = []
    if (!selectedItems.length) {
      activeSelectedItems = [ availableItems[0] ]
    }
    if (selectedItems.length) activeSelectedItems = [ selectedItems[0] ];

    this.setState({
      activeAvailableItems: [],
      activeSelectedItems,
      availableItems: availableItems.filter((item) => item.value.includes('__')),
      selectedItems: selectedItems.concat(fixValueOfUniqItems(availableItems)),
    }, this.handlePropagate);
  }

  handleDeselectAll = () => {
    const { availableItems, selectedItems } = this.state;

    let activeAvailableItems = []
    if (!availableItems.length) {
      activeAvailableItems = [ selectedItems[0] ]
    }
    if (availableItems.length) activeAvailableItems = [ availableItems[0] ];

    this.setState({
      activeAvailableItems,
      activeSelectedItems: [],
      availableItems: uniqBy(availableItems.concat(selectedItems), 'text'),
      selectedItems: [],
    }, this.handlePropagate);
  }

  handleMoveItemUp = () => {
    const { activeSelectedItems, selectedItems } = this.state;
    const activeItem = activeSelectedItems[0];

    if (!activeItem) return;
    const activeItemIndex = findIndex(selectedItems, activeItem);

    if (activeItemIndex === 0) return;

    const newSelectedItems = [...selectedItems];
    const upperItem = newSelectedItems[activeItemIndex - 1];
    newSelectedItems[activeItemIndex - 1] = activeItem;
    newSelectedItems[activeItemIndex] = upperItem;

    this.setState({ selectedItems: newSelectedItems }, this.handlePropagate);
  }

  handleMoveItemDown = () => {
    const { activeSelectedItems, selectedItems } = this.state;
    const activeItem = activeSelectedItems[0];

    if (!activeItem) return;
    const activeItemIndex = findIndex(selectedItems, activeItem);

    if (activeItemIndex === (selectedItems.length - 1)) return;

    const newSelectedItems = [...selectedItems];
    const lowerItem = newSelectedItems[activeItemIndex + 1];
    newSelectedItems[activeItemIndex + 1] = activeItem;
    newSelectedItems[activeItemIndex] = lowerItem;

    this.setState({ selectedItems: newSelectedItems }, this.handlePropagate);
  }

  handleDragItem = (itemContext, activeItemContext) => {
    return (dragIndex, hoverIndex) => {
      const items = this.state[itemContext];
      const itemToDrag = items[dragIndex];
      
      const newItems = [...items];

      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, itemToDrag);

      this.setState({
        [itemContext]: [...newItems],
        [activeItemContext]: [itemToDrag]
      }, this.handlePropagate);

      if (activeItemContext === 'activeSelectedItems') {
        if (this.props.onClickSelectedItem) this.props.onClickSelectedItem(itemToDrag);
      }
    };
  }

  handleDragItemToContext = (context) => {
    if (context === 'availableItems') { this.handleDeselectItem(); }
    else { this.handleSelectItem(); }
  }

  renderMiddleControls() {
    return (
      <div>
        <Icon name="angle right" size="big" link fitted onClick={this.handleSelectItem} />
        <Icon name="angle left" size="big" link fitted onClick={this.handleDeselectItem} />
        <Icon name="angle double right" size="big" fitted link onClick={this.handleSelectAll} />
        <Icon name="angle double left" size="big" fitted link onClick={this.handleDeselectAll} />
      </div>
    );
  }

  renderSortableControls() {
    return (
      <div>
        <Icon name="angle up" size="big" link fitted onClick={this.handleMoveItemUp} />
        <Icon name="angle down" size="big" link fitted onClick={this.handleMoveItemDown} />
      </div>
    );
  }

  render() {
    const { availableItems, activeAvailableItems, selectedItems, activeSelectedItems } = this.state;
    const { leftSideLabel, rightSideLabel, showExtraFilter } = this.props;

    const dragAvailableItem = this.handleDragItem('availableItems', 'activeAvailableItems');
    const dragSelectedItem = this.handleDragItem('selectedItems', 'activeSelectedItems');

    return (
      <Grid columns="equal">
        <Grid.Row>
          <Grid.Column>
            <ScrollableList
              title={leftSideLabel}
              items={availableItems}
              activeItems={activeAvailableItems}
              showExtraFilter={showExtraFilter}
              onChoose={this.handleChooseAvailableItems}
              doubleClick={this.handleSelectItem}
              dragItem={dragAvailableItem}
              dragItemToContext={this.handleDragItemToContext}
              multiple
              dropContext="availableItems"
            />
          </Grid.Column>

          <Grid.Column textAlign="center" verticalAlign="middle" style={{ maxWidth: '50px' }}>
            {this.renderMiddleControls()}
          </Grid.Column>

          <Grid.Column>
            <ScrollableList
              title={rightSideLabel}
              items={selectedItems}
              activeItems={activeSelectedItems}
              showExtraFilter={showExtraFilter}
              onChoose={this.handleChooseSelectedItems}
              doubleClick={this.handleDeselectItem}
              dragItem={dragSelectedItem}
              dragItemToContext={this.handleDragItemToContext}
              multiple
              dropContext="selectedItems"
            />
          </Grid.Column>

          <Grid.Column width={1} textAlign="center" verticalAlign="middle">
            {this.renderSortableControls()}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default DoubleSidedSelect;
