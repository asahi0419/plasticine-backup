import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import { DragSource, DropTarget } from 'react-dnd';

const itemSource = {
  beginDrag(props) {
    return {
      value: props.value,
      index: props.index,
    };
  },
  endDrag(props, monitor) {
    const dropResult = monitor.getDropResult();
    if (!dropResult) return;
    if (dropResult.dropContext === props.dropContext) return;

    props.dragItemToContext(dropResult.dropContext);
  },
};

const itemTarget = {
  hover(props, monitor, component) {
    const dragItem = monitor.getItem();
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragItem.index === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragItem.index < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragItem.index > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.dragItem(dragItem, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

@DropTarget('item', itemTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource('item', itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class Item extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.any.isRequired,
    click: PropTypes.func.isRequired,
    doubleClick: PropTypes.func.isRequired,
    dragItem: PropTypes.func.isRequired,
    dragStart: PropTypes.func.isRequired,
    dragEnd: PropTypes.func.isRequired,
    active: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    dragItemToContext: PropTypes.func.isRequired,
  };

  render() {
    const {
      value,
      click,
      doubleClick,
      dragStart,
      dragEnd,
      active,
      disabled,
      backgroundColor,
      text,
      connectDragSource,
      connectDropTarget,
    } = this.props;
    const style = {
      padding: '5px 10px',
      borderBottom: '1px solid #eee',
      userSelect: 'none',
      backgroundColor,
    };
    const component = typeof value === 'string' ? (value.includes('__') ? 'component' : '') : '';

    return connectDragSource(connectDropTarget(
      <div
        className={`${active} ${disabled} ${component} scrollable-list-item`}
        style={style}
        onMouseDown={click}
        onDoubleClick={doubleClick}
        onDragStart={dragStart}
        onDragEnd={dragEnd}
      >{text}</div>,
    ));
  }
}
