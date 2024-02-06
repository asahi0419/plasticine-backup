import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'semantic-ui-react';
import { Link } from 'react-router';

import history from '../../../history';
import * as HELPERS from '../../../helpers';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    touched: PropTypes.bool.isRequired,
    favorited: PropTypes.bool.isRequired,
    collapsed: PropTypes.bool.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    toggleCollapse: PropTypes.func.isRequired,
    onTouchEnd: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { active: false, favoriteIconHovered: false };
  }

  handleToggleFavorite = () => {
    this.props.toggleFavorite(this.props.item.id);
  }

  handleToggleCollapse = () => {
    const { item, toggleCollapse } = this.props;

    if (!this.state.favoriteIconHovered) toggleCollapse(item.id);
  }

  handleItemMouseEnter = (e) => {
    if (!HELPERS.isTablet()) this.setState({ active: true });
  }

  handleItemMouseLeave = (e) => {
    if (!HELPERS.isTablet()) this.setState({ active: false });
  }

  handleFavoriteIconEnter = () => this.setState({ favoriteIconHovered: true })
  handleFavoriteIconLeave = () => this.setState({ favoriteIconHovered: false })

  renderFavoriteIcon = () => {
    const { favorited, touched } = this.props;
    const { active, favoriteIconHovered } = this.state;

    if (!(active || touched) && !favorited) return null;

    const title = favorited
      ? i18n.t('unstar_this_module', { defaultValue: 'Unstar this module' })
      : i18n.t('star_this_module', { defaultValue: 'Star this module' });

    const name = favorited || favoriteIconHovered ? 'star' : 'star outline';
    const style = { position: 'absolute', top: 0, right: -25, marginLeft: 6, cursor: 'pointer' };
    const className = `favorite-icon favorite`;

    return (
      <Icon
        title={title}
        name={name}
        style={style}
        className={className}
        onClick={this.handleToggleFavorite}
        onMouseEnter={this.handleFavoriteIconEnter}
        onMouseLeave={this.handleFavoriteIconLeave}
      />
    );
  }

  renderHeader = () => {
    const { item, collapsed } = this.props;
    const style = {
      position: 'relative',
      lineHeight: '20px',
      wordBreak: 'break-word',
      marginRight: 15,
    };

    const contentStyle = { cursor: 'pointer' }

    const iconName = `caret ${collapsed ? 'right' : 'down'}`
    const iconStyle = { position: 'absolute', left: -20, cursor: 'pointer' }

    const content = item.plural || item.name;

    return (
      <Menu.Header style={style}>
        <span className="content" style={contentStyle} onClick={this.handleToggleCollapse}>
          <Icon name={iconName} style={iconStyle} />
          {content}
        </span>
        {this.renderFavoriteIcon()}
      </Menu.Header>
    );
  }

  renderMenu = () => {
    const { item } = this.props;

    return (
      <Menu.Menu>
        {item.views.map((view) => {
          const path = `/${item.alias}/view/${view.type}/${view.alias}#${HELPERS.makeUniqueID()}`;
          const onClick = HELPERS.isTablet()
            ? () => {
                this.props.onClose();
                history.push(path);
              }
            : null
          const to = HELPERS.isTablet()
            ? null
            : path

          return (
            <Menu.Item
              key={view.id}
              as={Link}
              content={view.name}
              path={path}
              onClick={onClick}
              to={to}
            />
          );
        })}
      </Menu.Menu>
    );
  }

  render() {
    const { collapsed } = this.props;
    const style = { paddingLeft: 24, paddingBottom: 5 };

    return (
      <Menu.Item
        style={style}
        onMouseEnter={this.handleItemMouseEnter}
        onMouseLeave={this.handleItemMouseLeave}
        onTouchEnd={this.props.onTouchEnd}
      >
        {this.renderHeader()}
        {!collapsed && this.renderMenu()}
      </Menu.Item>
    );
  }
}
