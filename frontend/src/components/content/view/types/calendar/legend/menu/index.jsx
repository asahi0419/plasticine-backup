import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isEmpty } from 'lodash/lang';
import { map } from 'lodash/collection';

import List from './list';

import * as CONFIGS from '../../configs';
import * as CONSTANTS from '../../../../../../../constants';

const LegendMenuStyled = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  border: 1px solid #d9d9d9;

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    padding: 10px;

    > div {
      margin-bottom: 10px;
      border-radius: 3px;
    }
  }
`

export default class LegendMenu extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    configs: PropTypes.object.isRequired,
  }

  getSections(data) {
    let result = [];
    map(data, dataObj => {
      const { tile: { props = {} } } = dataObj;
      map(['background', 'border', 'side'], formType => {
        if (!isEmpty(props[formType])) {
          const { name = '', options = [] } = props[formType];
          const filteredOptions = options.filter(({ name }) => !isEmpty(name));
          if (!isEmpty(filteredOptions)) {
            let newOptions = [];
            map(filteredOptions, opt => {
              const { name, color = '#FFFFFF' } = opt;
              newOptions.push({ name, color });
            });
            result.push({
              type: formType,
              name: name,
              options: newOptions
            });
          }
        }
      });
    });

    return result;
  }

  renderList() {
    const { data } = this.props;

    const sections = this.getSections(data);

    return (
      <List
        sections={sections}
      />
    );
  }

  render() {
    const style = {};

    if (this.props.configs.legendShow) {
      style.minWidth = CONFIGS.DEFAULT_LEGEND_MIN_WIDTH;
      style.maxWidth = this.props.configs.legendMaxWidth || CONFIGS.DEFAULT_LEGEND_MAX_WIDTH;
      style.width = this.props.configs.legendWidth || CONFIGS.DEFAULT_CONFIGS.legendWidth;
    } else {
      style.width = 0;
      style.opacity = 0;
    }

    return (
      <LegendMenuStyled vertical id="view-calendar-legend-menu" className="legend" style={style}>
        {this.renderList()}
      </LegendMenuStyled>
    );
  }
}