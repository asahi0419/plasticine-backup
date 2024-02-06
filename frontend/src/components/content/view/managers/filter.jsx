import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { each } from 'lodash/collection';

import * as CONSTANTS from '../../../../constants';
import * as HELPERS from '../../../../helpers';

import Filter from '../../../shared/filter';

const FilterManagerStyled = styled.div`
  .filter-content {
    margin-top: 12px;
    margin-left: 15px;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    .filter-content {
      margin-top: 18px;
    }
  }
`;

export default class FilterManager extends React.Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      view: PropTypes.object.isRequired,
      viewOptions: PropTypes.object.isRequired,
    }),

    configs: PropTypes.shape({
      showPredefined: PropTypes.object,
      showFilterManager: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      updateView: PropTypes.func.isRequired,
    }),
  }

  setNodeStyle = (type, style) => {
    if (type === 'sibling') {
      const parent = document.querySelector(".view-section.top");
      if (parent.childElementCount < 2) return;

      const sibling = document.querySelector(".view-section.top > .view-manager:last-child");
      if (!sibling) return;

      document.querySelector(".filter-controls").style.width = style.position === 'absolute' ? `calc(100% - ${sibling.clientWidth}px)` : 'initial';
      each(style, (value, key) => { sibling.style[key] = value });
    }
  }

  handleApplyFilter = (filter, options = {}) => {
    options.filter = filter;
    this.props.callbacks.updateView(options);
  };

  handleOpenFilterContent = () => {
    this.setNodeStyle('sibling', { position: 'absolute', right: '0px', top: HELPERS.isTablet() ? '18px' : '12px' })
  };

  handleCloseFilterContent = () => {
    this.setNodeStyle('sibling', { position: 'relative', right: 'initial', top: 'initial' })
  };

  renderManager = () => {
    const { model, viewOptions = {}, fields } = this.props.props || {};
    const { showFilterManager, showPredefined, compact = false } = this.props.configs;

    return (
      <Filter
        model={model}
        filter={viewOptions.filter}
        filterTree={viewOptions.filterTree}
        fields={fields}
        templates={viewOptions.templates}
        compact={compact}
        onApply={this.handleApplyFilter}
        onOpenContent={this.handleOpenFilterContent}
        onCloseContent={this.handleCloseFilterContent}
        interactiveLabel={true}
        readOnly={!showFilterManager}
        predefinedFilters={showPredefined.filters}
      />
    );
  }

  render() {
    if (!this.props.configs.showFilterManager && !this.props.configs.showPredefined.filters.length) return null;

    return (
      <FilterManagerStyled className="view-manager filter" style={{ flex: 1 }}>
        {this.renderManager()}
      </FilterManagerStyled>
    );
  }
}
