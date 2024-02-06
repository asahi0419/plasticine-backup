import React, { Component } from 'react';
import PropTypes from 'prop-types';

const stringIsWrapped = (content) => (content[0] === '(') && (content[content.length - 1] === ')');
const unWrapString = (content) => content.slice(1, content.length - 1);
const splitterElement = (content) => <span key="splitter" className="splitter">{content}</span>;

export default class QueryConditions extends Component {
  static propTypes = {
    query: PropTypes.string,
    humanizedQuery: PropTypes.string,
    resetFilter: PropTypes.func.isRequired,
  }

  static defaultProps = {
    query: '',
    humanizedQuery: '',
  }

  constructor(props) {
    super(props);
    this.setSplittedQuery(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setSplittedQuery(nextProps);
  }

  setSplittedQuery = ({ query, humanizedQuery }) => {
    this.splittedQuery = query ? query.split(' AND ') : [];
    this.splittedHumanizedQuery = humanizedQuery ? humanizedQuery.split(' AND ') : [];
  }

  processCondition = (condition) => {
    return stringIsWrapped(condition) ? unWrapString(condition) : condition;
  }

  handleConditionClick = (index) => {
    if (index === (this.splittedQuery.length - 1)) return;

    return this.props.resetFilter(this.splittedQuery.slice(0, index + 1).join(' AND '));
  }

  renderConditionElement = (condition, index) => {
    return (
      <span className="condition" key={index} onClick={() => this.handleConditionClick(index)}>
        {this.processCondition(condition)}
      </span>
    );
  }

  renderConditionElementSplitter = (index) => {
    return (index !== (this.splittedHumanizedQuery.length - 1)) ? splitterElement('AND') : null;
  }

  renderCondition = (condition, index) => {
    return (
      <span key={index}>
        {this.renderConditionElement(condition, index)}
        {this.renderConditionElementSplitter(index)}
      </span>
    );
  }

  renderConditionReset = () => {
    const { resettable, query, resetFilter } = this.props;
    if (!resettable) return;

    const elements = [(
      <span key="element" className="condition" style={{ whiteSpace: 'nowrap' }} onClick={() => resetFilter('')}>
        {i18n.t('all_records', { defaultValue: 'All records' })}
      </span>
    )];

    if (query) elements.push(splitterElement('>'));

    return elements;
  }

  renderConditions = () => {
    const { query, humanizedQuery, resetFilter } = this.props;

    return query && stringIsWrapped(query)
      ? <span className="condition" key="query" onClick={() => resetFilter(query)}>{humanizedQuery}</span>
      : this.splittedHumanizedQuery.map(this.renderCondition);
  }

  render() {
    return (
      <span className="wrapper">
        {this.renderConditionReset()}
        {this.renderConditions()}
      </span>
    );
  }
}
