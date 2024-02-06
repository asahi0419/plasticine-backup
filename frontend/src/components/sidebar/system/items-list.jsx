import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { uniq, without } from 'lodash/array';
import { includes } from 'lodash/collection';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { RegExpMarker } from 'react-mark.js';
import './marker-styles.css';

import Item from './item';

const ItemsListStyled = styled.div`
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
  overflow-y: auto;
`;

class ItemsList extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    searchTermRegexp: PropTypes.any.isRequired,
    favoriteItems: PropTypes.array.isRequired,
    collapsedItems: PropTypes.array.isRequired,
    updateSidebar: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { touchedItem: null };
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  shouldComponentUpdate(nextProps) {
    return !lodash.isEqual(this.props.searchTermRegexp, nextProps.searchTermRegexp)
      || !lodash.isEqual(this.props.items, nextProps.items)
      || !lodash.isEqual(this.props.favoriteItems, nextProps.favoriteItems)
      || !lodash.isEqual(this.props.collapsedItems, nextProps.collapsedItems)
  }

  markerColorSwitcher = () => {
    const { theme } = this.props;

    switch (theme) {
      case 'dark':
        return 'dark';
      default:
        return 'light';
    }
  }

  getMatchedItems = (items, id) =>
    includes(items, id) ? without([...items], id) : uniq([...items].concat(id));

  handleToggleFavorite = (id) => {
    const { favoriteItems, updateSidebar } = this.props;
    updateSidebar({ favoriteItems: this.getMatchedItems(favoriteItems, id) });
  }

  handleToggleCollapse = (id) => {
    const { collapsedItems, updateSidebar } = this.props;
    updateSidebar({ collapsedItems: this.getMatchedItems(collapsedItems, id) });
  }

  handleTouchItem = (id) => {
    this.timeout = setTimeout(() => {
      this.setState({ touchedItem: id });
    }, 50);
  }

  handleMouseLeave = () => {
    this.setState({ touchedItem: null });
  }

  renderItems = () => {
    const { items, favoriteItems, collapsedItems } = this.props;
    const { touchedItem } = this.state;

    return items.map((item) => {
      const touched = touchedItem === item.id
      const favorited = favoriteItems.includes(item.id)
      const collapsed = collapsedItems.includes(item.id)
      const onTouchEnd = () => this.handleTouchItem(item.id)
 
      return (
        <Item
          key={item.id}
          item={item}
          touched={touched}
          favorited={favorited}
          collapsed={collapsed}
          toggleFavorite={this.handleToggleFavorite}
          toggleCollapse={this.handleToggleCollapse}
          onTouchEnd={onTouchEnd}
          onClose={this.props.onClose}
        />
      )
    });
  }

  render() {
    const items = this.renderItems();
    if (!items.length) return null;

    const options = { className: this.markerColorSwitcher() }

    return (
      <ItemsListStyled className="items-list" onMouseLeave={this.handleMouseLeave}>
        <RegExpMarker mark={this.props.searchTermRegexp} options={options}>
          {items}
        </RegExpMarker>
      </ItemsListStyled>
    );
  }
}

const mapStateToProps = (state) => {
  return { theme: state.app.settings.theme };
}

export default connect(mapStateToProps)(ItemsList);