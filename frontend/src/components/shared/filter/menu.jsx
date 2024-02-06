import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Icon, Dropdown, Button } from 'semantic-ui-react';
import styled from 'styled-components';
import { sortBy } from 'lodash/collection';
import { isEmpty } from 'lodash/lang';

const MenuStyled = styled.div`
  position: relative;
  align-items: baseline;

  .filters-menu-as-dropdown-buttons {
    > button.ellipsis {
      position: relative;
      width: 32px;
      height: 32px;
      min-width: 32px !important;
      i {
        position: relative;
        top: 1px;
        left: -1px;
      }
    }
  }
`;

export default class Menu extends Component {
  static propTypes = {
    query: PropTypes.string,
    applyFilter: PropTypes.func.isRequired,
    asDropdown: PropTypes.bool.isRequired,
    filters: PropTypes.array,
  }

  static defaultProps = {
    filters: [],
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    node && (this.parentWidth = node.parentNode.clientWidth);
  }

  renderFiltersGhostButtons = () => {
    // TODO: need to refactor
    const { applyFilter, filters } = this.props;

    const marginRight = 5;
    let width = 0;

    return sortBy(filters, ['id']).map((f = {}, key) => {
      const fName = f.name;
      const fQuery = f.query || '';
      const active = this.props.query === fQuery;
      const onClick = () => !active && applyFilter(fQuery);
      const style = { position: 'absolute', top: -10000, marginRight, display: 'inline-block' };

      if (!isEmpty(this.refs) && this.refs[key]) {
        width = width + (this.refs[key].ref.clientWidth + marginRight);
        if (this.parentWidth < width) this.refs[key].hide = true;
      }

      return (
        <Button
          key={key}
          ref={key}
          onClick={onClick}
          active={active}
          style={style}
        >{fName}</Button>
      );
    });
  }

  renderFiltersButtons = () => {
    if (isEmpty(this.refs)) return this.forceUpdate();

    const buttons = Object.values(this.refs).filter(({ hide }) => !hide);

    return buttons.map(({ props: { children, onClick, active } }, key) => (
      <Button
        key={key}
        onClick={onClick}
        active={active}
        style={{ marginRight: '5px', display: 'inline-block' }}
      >{children}</Button>
    ));
  }

  renderFiltersDropdownButtons = () => {
    const buttons = Object.values(this.refs).filter(({ hide }) => hide);

    if (!buttons.length) return;

    const trigger = <Button icon="ellipsis horizontal" className="ellipsis" />;

    return (
      <Dropdown trigger={trigger} icon={null} className="filters-menu-as-dropdown-buttons" key="db">
        <Dropdown.Menu style={{ width: '140px', top: '37px', right: 0 }}>
          {buttons.map(({ props: { children, onClick, active } }, key) => (
            <Dropdown.Item key={key} onClick={onClick} active={active}>
              {children}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderAsDropdown = () => {
    const { applyFilter, filters } = this.props;

    const trigger = <Icon name="ellipsis vertical" className="filter-menu-trigger ellipsis" style={{ width: '10px' }} link />;

    return (
      <Dropdown trigger={trigger} icon={null} key="d">
        <Dropdown.Menu style={{ width: '140px', right: 0 }}>
          {filters.map((f = {}, key) => {
            const fName = f.name;
            const fQuery = f.query || '';
            const active = this.props.query === fQuery;
            const onClick = () => !active && applyFilter(fQuery);

            return (
              <Dropdown.Item
                key={key}
                active={active}
                onClick={onClick}
              >{fName}</Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderAsButtons = () => {
    return [
      this.renderFiltersGhostButtons(),
      this.renderFiltersButtons(),
      this.renderFiltersDropdownButtons(),
    ];
  }

  render() {
    if (!this.props.filters.length) return null;

    return (
      <MenuStyled className="filter-menu">
        {this.props.asDropdown
          ? this.renderAsDropdown()
          : this.renderAsButtons()}
      </MenuStyled>
    );
  }
}
