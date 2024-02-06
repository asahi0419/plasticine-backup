import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';

const StylingWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;

  > .ui.dropdown {
    button {
      position: relative;
      height: 32px;
    }

    .menu {
      width: 140px;
      left: initial;
      right: 0;
      top: 40px;
    }
  }
`;

export default class extends Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    onAddWidget: PropTypes.func.isRequired,
    onApplyChanges: PropTypes.func.isRequired,
    onCancelChanges: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    handleAction: PropTypes.func, // to the future
  }

  renderAddButton = () => {
    const { onAddWidget } = this.props;

    const trigger = <Button basic><Icon name="plus"/></Button>;

    return (
      <Dropdown trigger={trigger} icon={null}>
        <Dropdown.Menu>
          <Dropdown.Item content={i18n.t('add_view_widget_on_dashboard', { defaultValue: 'Add View Widget' })} onClick={onAddWidget} />
          <Dropdown.Item content={i18n.t('add_dynamic_tabs_widget_on_dashboard', { defaultValue: 'Add Dynamic Tabs Widget' })} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { mode, onApplyChanges, onCancelChanges, onEdit } = this.props;

    if (mode === 'edit') {
      return (
        <StylingWrapper>
          {this.renderAddButton()}
          <Button basic content={i18n.t('cancel_changes_on_dashboard', { defaultValue: 'Cancel' })} onClick={onCancelChanges}/>
          <Button basic content={i18n.t('apply_changes_on_dashboard', { defaultValue: 'Apply' })} onClick={onApplyChanges}/>
        </StylingWrapper>
      );
    } else {
      return (
        <StylingWrapper>
          <Button basic content={i18n.t('edit_dashboard', { defaultValue: 'Edit' })} onClick={onEdit}/>
        </StylingWrapper>
      );
    }
  }
}
