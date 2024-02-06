import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { map } from 'lodash/collection';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../../../../constants';
import * as CONFIGS from '../../configs';

const LegendMenuListStyled = styled.div`
  width: 100%;
  height: calc(100% - 70px);
  overflow-y: auto;

  .icon {
    cursor: pointer;
  }

  .legend-list-wrapper {
    padding: 10px;
  }

  .legend-list {
    position: relative;
    display: flex;
    justify-content: space-between;
    line-height: 20px;
    word-break: break-word;

    > div {
      white-space: nowrap;
      &:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &.section {
      margin: 0;

      .legend-list-name,
      .legend-list-size {
        font-weight: bold;
      }
    }

    &.group {
      .legend-list-name,
      .legend-list-size {
        opacity: 0.7;
      }
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    height: calc(100% - 83px);
  }
`;

export default class LegendMenuList extends Component {
  static propTypes = {
    sections: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
  }

  renderOption = (sectionType, opt = {}, i) => {
    let style = { color: opt.color || '#ffffff', cursor: 'pointer' };
    if (sectionType == 'side') {
      style.transform = 'scaleX(0.5)';
    }
    const icon = CONFIGS.ICON_TYPES[sectionType];

    return (
      <div key={i}>
        <div className="legend-list group">
          <div>
            <Icon
              name={icon}
              style={style}
            />
            <span
              title={opt.name}
              className="legend-list-name"
            >{opt.name}</span>
          </div>
        </div>
      </div>
    );
  }

  renderSectionContent = (section = {}) => {
    const style = { paddingLeft: '7px' };

    return (
      <div style={style}>
        {map(section.options, (opt = {}, i) => this.renderOption(section.type, opt, i))}
        <hr style={{ width: '80%', margin: 'auto', marginTop: '10px' }} />
      </div>
    );
  }

  renderSectionHeader = (section = {}) => {
    return (
      <div className="legend-list section" style={{ backgroundColor: section['bg-color'] }}>
        <div className="legend-list-container">
          <span className="legend-list-name" title={section.name}>
            {section.name}
          </span>
        </div>
      </div>
    );
  }

  renderSection = (section = {}, i) => {
    return (
      <div key={i} className="legend-list-wrapper">
        {this.renderSectionHeader(section)}
        {this.renderSectionContent(section)}
      </div>
    );
  }

  render() {
    return (
      <LegendMenuListStyled className="legend-list">
        {map(this.props.sections, this.renderSection)}
      </LegendMenuListStyled>
    );
  }
}
