import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Menu, Icon } from 'semantic-ui-react';
import { map, filter, groupBy, find } from 'lodash/collection';

import store from '../../../store';
import * as CONSTANTS from '../../../constants';

import SearchBar from '../../shared/search-bar';
import ControlPanel from '../../shared/control-panel';
import ItemsList from './items-list';

const SidebarStyled = styled(Menu)`
  position: relative;
  display: inline-block !important;
  height: 100%;
  margin: 0 !important;
  border: none;
  border-radius: 0 !important;
  box-shadow: none;
  z-index: 0;

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    height: auto !important;
    min-height: 100% !important;
    width: 100% !important;
    padding: 10px;
    border-right: 0 !important;

    > div {
      position: relative !important;
      top: initial !important;
      margin-bottom: 10px;
      border-radius: 3px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .items-list {
      > .item {
        padding-top: 9px !important;
        padding-bottom: 8px !important;

        .header {
          margin-bottom: 0;
        }

        .menu {
          margin-top: 5px !important;
          margin-bottom: 0 !important;
        }
      }
    }
  }
`;

export default class SystemSidebar extends Component {
  static propTypes = {
    models: PropTypes.array,
    views: PropTypes.array,
    options: PropTypes.object.isRequired,
    updateSidebar: PropTypes.func.isRequired,
  }

  static defaultProps = {
    models: [],
    views: [],
  }

  constructor(props) {
    super(props);

    const searchTerm = ''
    const searchTermRegexp = new RegExp(searchTerm, 'gi')

    this.state = {
      items: [],
      searchTerm,
      searchTermRegexp,
      viewsByModel: groupBy(props.views, 'model'),
      collapsedItems: props.options.collapsedItems || [],
      favoriteItems: props.options.favoriteItems || [],
      showFavorites: false,
      showCore: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { models = [], views = {}, options = {} } = nextProps
    const { collapsedItems = [], favoriteItems = [] } = options;

    const state = {}

    if (!lodash.isEqual(this.state.collapsedItems, collapsedItems)) {
      state.collapsedItems = collapsedItems
    }
    if (!lodash.isEqual(this.state.favoriteItems, favoriteItems)) {
      state.favoriteItems = favoriteItems
    }
    if (!lodash.isEqual(this.props.models, models) || !lodash.isEqual(this.props.views, views)) {
      state.viewsByModel = groupBy(views, 'model')
      state.items = this.getVisibleItems({ models, views }, '', state.viewsByModel)
    }

    if (!lodash.isEmpty(state)) {
      this.setState(state)
    }
  }

  componentWillUnmount() {
    clearInterval(this.searchTimeout);
  }

  getVisibleItems = (props = {}, searchTermRegexp, viewsByModel = this.state.viewsByModel) => {
    return lodash.reduce(props.models, (r, m, k) => {
      const views = viewsByModel[m.id]
      if (!views) return r;

      m.views = m.name.match(searchTermRegexp) || m.plural?.match(searchTermRegexp)
        ? views
        : filter(views, ({ name = '' }) => name.match(searchTermRegexp))

      if (m.views.length) r.push(m)
      return r
    }, [])
  }

  handleSearch = (term) => {
    const searchTerm = term
    const searchTermRegexp = new RegExp(searchTerm, 'gi')

    this.setState({
      searchTerm,
    }, () => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.setState({
          searchTermRegexp,
          collapsedItems: [],
          items: this.getVisibleItems(this.props, searchTermRegexp),
        })
      }, 300)
    })
  }

  handleUpdate = (settings) => {
    this.props.updateSidebar(settings);
    this.setState({ ...this.state, ...settings });
  }

  handleToggleCollapseAllItems = () => {
    const { items } = this.state;
    const collapsedItems = this.state.collapsedItems.length === items.length ? [] : map(items, 'id');

    this.setState({ collapsedItems });
    this.props.updateSidebar({ collapsedItems });
  }

  handleToggleShowFavorites = () => this.setState({ showFavorites: !this.state.showFavorites })
  handleToggleShowCore = () => this.setState({ showCore: !this.state.showCore })

  handleClose = () => {
    const pages = store.redux.state('metadata.app.page');
    const hasHeader = !!find(pages, { alias: 'header_container' });
    const mode = hasHeader ? 'show_content_only' : 'show_content_without_sidebar_without_header';

    PubSub.publish('switch_layout_mode', mode);
  }

  renderSearchBar() {
    return (
      <SearchBar
        value={this.state.searchTerm}
        onSearch={this.handleSearch}
        placeholder={i18n.t('search_module', { defaultValue: 'Search module ...' })}
        style={{ position: 'absolute', height: '30px' }}
      />
    );
  }

  renderControlPanel() {
    const { items = [], collapsedItems = [], showFavorites, showCore } = this.state;
    const collapseAll = collapsedItems.length === items.length;

    const collapseAllIcon = collapseAll ? 'plus' : 'minus';
    const showFavoritesIcon = 'star';
    const showCoreIcon = 'cogs';

    const collapseAllClassName = collapseAll ? ' active' : ''
    const showFavoritesClassName = showFavorites ? ' active' : ''
    const showCoreClassName = showCore ? ' active' : ''

    const collapseAllText = collapseAll
      ? i18n.t('expand_all', { defaultValue: 'Expand all' })
      : i18n.t('collapse_all', { defaultValue: 'Collapse all' });

    const showFavoritesText = showFavorites
      ? i18n.t('show_all', { defaultValue: 'Show all' })
      : i18n.t('show_favorites_only', { defaultValue: 'Show favorites only' });

    const showCoreText = showCore
      ? i18n.t('show_all', { defaultValue: 'Show all' })
      : i18n.t('show_core_only', { defaultValue: 'Show core only' });

    return (
      <ControlPanel style={{ position: 'absolute', top: '30px' }}>
        <Icon
          className={collapseAllClassName}
          name={collapseAllIcon}
          title={collapseAllText}
          onClick={this.handleToggleCollapseAllItems}
        />
        <Icon
          className={showFavoritesClassName}
          name={showFavoritesIcon}
          title={showFavoritesText}
          onClick={this.handleToggleShowFavorites}
        />
        <Icon
          className={showCoreClassName}
          name={showCoreIcon}
          title={showCoreText}
          onClick={this.handleToggleShowCore}
        />
      </ControlPanel>
    );
  }

  renderItemsList() {
    const { items, favoriteItems, collapsedItems, showFavorites, showCore } = this.state;

    let itemsToShow = items;
    if (showFavorites) itemsToShow = itemsToShow.filter(({ id }) => favoriteItems.includes(id));
    if (showCore) itemsToShow = itemsToShow.filter(({ type }) => type === 'core');

    return (
      <ItemsList
        items={itemsToShow}
        searchTermRegexp={this.state.searchTermRegexp}
        favoriteItems={favoriteItems}
        collapsedItems={collapsedItems}
        updateSidebar={this.handleUpdate}
        onClose={this.handleClose}
      />
    );
  }

  render() {
    return (
      <SidebarStyled vertical className="system-sidebar">
        {this.renderSearchBar()}
        {this.renderControlPanel()}
        {this.renderItemsList()}
      </SidebarStyled>
    );
  }
}
