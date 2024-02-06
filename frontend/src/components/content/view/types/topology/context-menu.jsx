import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash/collection';
import { Menu } from 'semantic-ui-react'

import * as HELPERS from '../../../../../helpers';

export default class extends React.Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    actions: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);

    this.id = `${HELPERS.makeUniqueID()}-context-menu`;
  }

  handleAction = async (action) => {
    this.props.callbacks.handleAction();

    let options = {}

    if (action.executeScript.client) {
      let result = await action.executeScript.client();

      if (typeof result === 'object') {
        if (result.result === true) {
          options.ui_params = result.ui_params;
          result = true;
        } else {
          result = false;
        }
      }

      if (!result) return;
    }
    
    if (action.executeScript.server) {
      action.executeScript.server(options);
    }
  }

  renderItems = () => {
    return map(this.props.actions, (action) => {
      const onClick = () => this.handleAction(action);
      const className = 'react-contextmenu-item';

      return (
        <Menu.Item key={action.id} onClick={onClick} className={className}>
          {action.name}
        </Menu.Item>
      );
    });
  }

  render() {
    //if (!this.props.actions.length) return null;

    const className = 'react-contextmenu';
    const style = { position: 'absolute', left: this.props.x - 1, top: this.props.y - 1 };

    return (
      <div style={style} className={className}>
        {this.renderItems()}
      </div>
    );
  }
}
