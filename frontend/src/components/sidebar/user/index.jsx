import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Menu } from 'semantic-ui-react';

import * as CONSTANTS from '../../../constants';
import { parseOptions } from '../../../helpers';
import { createLayout } from './helpers';

import elementFactory from './element';

const SidebarStyled = styled(Menu)`
  position: relative;
  display: inline-block !important;
  height: 100%;
  margin: 0 !important;
  border: none;
  border-radius: 0 !important;
  box-shadow: none;
  overflow-y: auto;
  z-index: 10;

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    display: none !important;
  }
`;

export default class UserSidebar extends Component {
  static propTypes = {
    handleAction: PropTypes.func.isRequired,
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    models: PropTypes.array,
    views: PropTypes.array,
    pages: PropTypes.array,
    actions: PropTypes.array,
    dashboards: PropTypes.array,
  }

  static defaultProps = {
    models: [],
    views: [],
    pages: [],
    actions: [],
    dashboards: [],
  }

  renderGroup = (group = {}, key) => {
    if (!group.components.length) return

    return (
      <div className="group" key={key}>
        {group?.params?.name && (
          <div className="title" style={{
            height: '29px',
            fontSize: '15px',
            lineHeight: '29px',
            textAlign: 'center',
            marginBottom: '10px',
          }}>{group.params.name}</div>
        )}
        {group.components.map(this.renderComponent)}
      </div>
    );
  }

  renderComponent = (component, key) => {
    return (
      <div key={key}>
        {elementFactory(component, this.props)}
      </div>
    )
  }

  render() {
    const options = parseOptions(this.props.record.options);
    const components = createLayout(options.components);

    return (
      <SidebarStyled vertical className="user-sidebar">
        {components.groups.map(this.renderGroup)}
      </SidebarStyled>
    );
  }
}
