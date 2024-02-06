import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon } from 'semantic-ui-react';

ConditionMenu.propTypes = {
  handleJSOpen: PropTypes.func.isRequired,
}

function ConditionMenu(props) {
  const trigger = <Icon name="ellipsis vertical" link />;

  return (
    <Dropdown trigger={trigger} icon={null} style={{ float: 'left', marginTop: 5 }}>
      <Dropdown.Menu>
        <Dropdown.Item onClick={props.handleJSOpen}>
          {i18n.t('menu_with_js_script', { defaultValue: 'With JS script' })}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ConditionMenu
