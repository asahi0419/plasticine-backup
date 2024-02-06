import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isEmpty } from 'lodash/lang';
import { Dropdown } from 'semantic-ui-react';

const DropdownNestable = styled(Dropdown)`
  .active .text {
    font-weight: 400;
  }

  .item {
    display: flex !important;
    justify-content: space-between;
  }

  .item:hover > .menu {
    overflow: visible;
    width: auto;
    height: auto;
    top: 0!important;
    left: 100%!important;
    opacity: 1;
  }
`;

export default class extends Component {
  static propTypes = {
    icon: PropTypes.element,
    trigger: PropTypes.element,
    className: PropTypes.string,
    simple: PropTypes.bool,
    open: PropTypes.bool,
  }

  static defaultProps = {
    simple: false,
    open: false,
    icon: null,
  }

  constructor(props) {
    super(props);

    this.state = { simple: props.simple, open: props.open };
  }

  componentWillReceiveProps(nextProps) {
    const nextState = {};

    if (nextProps.simple !== this.state.simple) nextState.simple = nextProps.simple;
    if (nextProps.open !== this.state.open) nextState.open = nextProps.open;

    if (!isEmpty(nextState)) this.setState(nextState);
  }

  handleClick = () => {
    this.setState({ open: true });
  }

  handleOpen = () => {
    this.setState({ simple: true });
  }

  handleBlur = () => {
    this.setState({ simple: false, open: false });
  }

  render() {
    const { trigger, icon, className, children } = this.props;
    const { open, simple } = this.state;

    return (
      <DropdownNestable
        icon={icon}
        trigger={trigger}
        className={className}
        open={open}
        simple={simple}
        onClick={this.handleClick}
        onOpen={this.handleOpen}
        onBlur={this.handleBlur}
      >{children}</DropdownNestable>
    );
  }
}
