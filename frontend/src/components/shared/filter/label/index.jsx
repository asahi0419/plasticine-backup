import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import Conditions from './conditions';

const LabelStyled = styled.div`
  position: relative;
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'initial'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};

  i.filter {
    position: relative;
    top: 1px;
    font-size: 18px;
  }

  span.splitter {
    margin: 0 8px;
  }

  span.condition {
    cursor: ${({ resettable }) => resettable ? 'pointer' : 'initial'};
    line-height: 24px;
    word-break: break-word;

    &:hover {
      text-decoration: ${({ resettable }) => resettable ? 'underline' : 'initial'};
    }
  }

  span.filter-link {
    line-height: 32px;
    cursor: pointer;
  }

  span.filter-link:hover {
    text-decoration: ${({ resettable }) => resettable ? 'underline' : 'initial'};
  }
`;

export default class FilterLabel extends Component {
  static propTypes = {
    active: PropTypes.bool,
    query: PropTypes.string,
    humanizedQuery: PropTypes.string,
    onOpenFilter: PropTypes.func.isRequired,
    interactive: PropTypes.bool,
    resettable: PropTypes.bool,
    disabled: PropTypes.bool,
    applyFilter: PropTypes.func,
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.active !== nextProps.active) return true;
    if (this.props.query === nextProps.query &&
        this.props.humanizedQuery === nextProps.humanizedQuery) return false;

    return true;
  }

  resetFilter = (query) => {
    const { interactive, applyFilter } = this.props;
    return interactive && applyFilter(query);
  }

  renderFilterIcon() {
    return (
      <Icon
        link
        name="filter"
        onClick={this.props.onOpenFilter}
      />
    );
  }

  renderFilterLink() {
    return (
      <span className="filter-link" onClick={this.props.onOpenFilter}>
        {i18n.t('filter', { defaultValue: 'Filter' })}
      </span>
    );
  }

  renderSplitterElement() {
    const { resettable, query, active } = this.props;

    if (active || (!resettable && !query)) return <span className="splitter"></span>;

    return <span className="splitter">&gt;</span>;
  }

  renderConditions() {
    const { active, children, resettable, query, humanizedQuery } = this.props;
    if (active) return children;

    return (
      <Conditions
        query={query}
        resettable={resettable}
        humanizedQuery={humanizedQuery}
        resetFilter={this.resetFilter}
      />
    );
  }

  render() {
    const { resettable, disabled } = this.props;

    return (
      <LabelStyled resettable={resettable} disabled={disabled} className="filter-label">
        {this.renderFilterIcon()}
        {this.renderFilterLink()}
        {this.renderSplitterElement()}
        {this.renderConditions()}
      </LabelStyled>
    );
  }
}
