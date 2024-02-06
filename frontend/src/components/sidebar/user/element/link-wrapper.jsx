import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';

export default class extends Component {
  static propTypes = {
    to: PropTypes.string,
    target: PropTypes.string,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    onClick: PropTypes.func,
  }

  render() {
    const { to, target, name, icon, onClick } = this.props;

    return (
      <div className="item" style={{ textAlign: 'center', marginBottom: '10px', padding: '0 10px' }}>
        <Link style={{ cursor: 'pointer' }} to={to} target={target} onClick={onClick}>
          {icon && <Icon name={icon} style={{ height: '48px', fontSize: '36px', lineHeight: '48px' }}/>}
          {icon && <br/>}
          <span style={{ fontSize: '18px' }}>{name}</span>
        </Link>
      </div>
    );
  }
}
