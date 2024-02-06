import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

export default class UserButtons extends Component {
  static propTypes = {
    getAction: PropTypes.func.isRequired,
    record: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
  }

  handleUserCancel = () => this.props.getAction('cancel_user_layout')()
  handleUserAction = (alias) => {
    const { getAction, type, record } = this.props;
    const record_id = record.record_id || record.id;
    getAction(alias)({ ...record, record_id, type });
  }

  render() {
    return (
      <div style={{ position: 'absolute', top: '-60px', right: 0 }}>
        <div>
          <Button basic type="submit" floated="right" onClick={this.handleUserCancel}>Cancel</Button>
          <Button basic type="submit" floated="right" onClick={this.handleUserAction.bind(this, 'reset_user_layout')}>Reset</Button>
          <Button basic type="submit" floated="right" onClick={this.handleUserAction.bind(this, 'save_user_layout')}>Apply</Button>
        </div>
      </div>
    );
  }
}
