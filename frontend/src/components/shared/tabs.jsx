import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { compact } from 'lodash/array';
import { Menu, Icon } from 'semantic-ui-react';

import localStore from '../../store/local';

const StylingMenuWrapper = styled(Menu)`
  margin: 0 !important;

  > .item.with-context-menu {
    padding: 0 !important;

    .react-contextmenu-wrapper {
      padding: .965em 1.378em;
    }
  }
`

class Pane extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    labelContextMenuRenderer: PropTypes.func,
    error: PropTypes.bool,
    required: PropTypes.bool,
  }

  static defaultProps = {
    error: false,
    required: false,
  }

  render() {
    return <div className="tabs__pane">{this.props.children}</div>;
  }
}

export default class Tabs extends Component {
  static propTypes = {
    storeToKey: PropTypes.string,
    selected: PropTypes.number,
    onSelect: PropTypes.func,
    pointing: PropTypes.bool,
  }

  static defaultProps = {
    selected: 0,
    storeToKey: '',
    pointing: false,
  }

  static Pane = Pane;

  constructor(props) {
    super(props);

    this.state = { selected: this.getSelected(props) };
  }

  componentDidMount() {
    if (this.props.onSelect) this.props.onSelect(this.state.selected);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.storeToKey) return;

    this.setState({ selected: this.getSelected(nextProps) });
  }

  getSelected = (props) => {
    const savedSelectedTab = props.storeToKey && parseInt(localStore.get(`tabs/${props.storeToKey}`)) || 0;
    return savedSelectedTab <= props.children.length ? savedSelectedTab : props.selected;
  }

  selectTab = (i) => {
    const { storeToKey, onSelect } = this.props;
    storeToKey && localStore.set(`tabs/${storeToKey}`, i);
    this.setState({ selected: i });
    onSelect && onSelect(i);
  }

  renderTabMenuItemLabel(component) {
    if (component.error) {
      return (
        <div style={{ color: '#db2828' }}>
          <Icon name="asterisk" />
          {component.label}
        </div>
      );
    } else if (component.required) {
      return (
        <div>
          <Icon name="asterisk" />
          {component.label}
        </div>
      );
    } else {
      return component.label;
    }
  }

  renderTabMenuItem(component = {}, i) {
    const { props = {} } = component;
    const { labelContextMenuRenderer: cmr } = props;

    const active = this.state.selected === i;
    const content = cmr ? cmr(this.renderTabMenuItemLabel(component.props)) : this.renderTabMenuItemLabel(component.props);
    const className = cmr ? 'with-context-menu' : '';

    const onClick = () => this.selectTab(i);
    const onContextMenu = () => this.selectTab(i);

    return (
      <Menu.Item key={i} active={active} className={className} onClick={onClick} onContextMenu={onContextMenu}>
        {content}
      </Menu.Item>
    );
  }

  renderTabMenu() {
    const style = { overflowX: 'auto', overflowY: 'hidden' };
    const menu = this.props.pointing ? { pointing: true, secondary: true } : { tabular: true };

    return (
      <div style={style} >
        <StylingMenuWrapper {...menu} className="tabs__menu">
          {compact(this.props.children).map((component, i) => this.renderTabMenuItem(component, i))}
        </StylingMenuWrapper>
      </div>
    );
  }

  renderTabContent() {
    const content = this.props.children[this.state.selected];

    return (
      <div className="tabs__content">
        {content}
      </div>
    );
  }

  render() {
    return (
      <div className="tabs">
        {this.renderTabMenu()}
        {this.renderTabContent()}
      </div>
    );
  }
}
