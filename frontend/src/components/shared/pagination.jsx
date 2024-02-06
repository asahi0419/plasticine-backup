import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, Loader } from 'semantic-ui-react';
import { Input } from 'semantic-ui-react';
import { isNaN, isUndefined } from 'lodash/lang';

import * as CONSTANTS from '../../constants';

import IconButton from './icon-button';

const PaginationStyled = styled.div`
  .pagination-full {
    .icon {
      position: relative;
      top: 1px;
      max-width: 13;
      margin: 0;
      cursor: pointer;
    }
  }

  .pagination-compact {
    display: none;
  }

  .numbers {
    line-height: 30px;
  }

  .input {
    width: ${({ width }) => width};
    min-width: 29px;

    input {
      text-align: center;
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    .pagination-full {
      display: none;
    }

    .pagination-compact {
      display: flex;
    }

    .icon-button {
      width: 28px;
      height: 32px;
      font-size: 16px;
      line-height: 16px;

      &:nth-child(1),
      &:nth-child(4) {
        margin-right: 10px;
      }
    }

    .numbers {
      margin: 0 15px;
    }
  }
`;

export default class Pagination extends React.Component {
  static propTypes = {
    currentPage: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    totalSize: PropTypes.number.isRequired,
    onPageChanged: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.firstPage = 1;

    const numberOfPages = Math.ceil(props.totalSize / props.size);

    this.state = {
      numberOfPages,
      totalSize: props.totalSize,
      pageControlInputValue: props.currentPage,
      pageRangeInputValue: props.currentPage * props.size - props.size + 1,
      lastPage: numberOfPages >= 1 ? numberOfPages : 1,
      currentPageRangeSize: this.getCurrentPageRangeSize(props),
    };
  }

  componentWillReceiveProps(nextProps) {
    const numberOfPages = Math.ceil(nextProps.totalSize / nextProps.size);
    const pageRangeInputValue = nextProps.currentPage * nextProps.size - nextProps.size + 1;
    const currentPageRangeSize = this.getCurrentPageRangeSize(nextProps);

    this.setState({
      numberOfPages,
      totalSize: nextProps.totalSize,
      pageControlInputValue: nextProps.currentPage,
      lastPage: numberOfPages >= 1 ? numberOfPages : 1,
      pageRangeInputValue,
      currentPageRangeSize,
    });
  }

  shouldComponentUpdate(nextProps) {
    if (isNaN(nextProps.totalSize) || isUndefined(nextProps.totalSize)) return false;

    return true;
  }

  changePage = (num) => {
    const { onPageChanged, size } = this.props;

    if (onPageChanged) onPageChanged({ page: { number: num, size }});
  }

  goToFirstPage = () => {
    if (this.props.currentPage === this.firstPage) return;

    this.changePage(this.firstPage);
    this.setState({ pageControlInputValue: this.firstPage, pageRangeInputValue: this.firstPage });
  }

  goToLastPage = () => {
    const { size } = this.props;
    const { totalSize, pageRangeInputValue, lastPage } = this.state;

    if (totalSize - pageRangeInputValue < size) return;

    this.changePage(lastPage);
    this.setState({
      pageControlInputValue: lastPage,
      pageRangeInputValue: lastPage === 1 ? 1 : (lastPage * size - 9)
    });
  }

  goToPrevPage = () => {
    const { currentPage, size } = this.props;
    const { pageControlInputValue } = this.state;

    if (currentPage === this.firstPage) return;

    this.changePage(currentPage - 1);
    this.setState({ pageControlInputValue: pageControlInputValue - 1 });
    this.setState({ pageRangeInputValue: (pageControlInputValue - 2) * size + 1 });
  }

  goToNextPage = () => {
    const { currentPage, size } = this.props;
    const { totalSize, pageControlInputValue, pageRangeInputValue, lastPage } = this.state;

    if (currentPage === lastPage) return;

    this.changePage(currentPage + 1);
    this.setState({ pageControlInputValue: pageControlInputValue + 1 });
    if (pageRangeInputValue <= (totalSize - size)) {
      this.setState({ pageRangeInputValue: pageControlInputValue * size + 1 });
    }
  }

  changeControlInput = ({ target: { value, style } }) => {
    style.width = (value.length + 1) * 8 + 13 + 'px';
    if (!value.length) style.width = '29px';

    this.setState({ pageControlInputValue: value });
  }

  changeRangeInput = ({ target: { value, style } }) => {
    style.width = (value.length + 1) * 8 + 13 + 'px';
    if (!value.length) style.width = '29px';

    this.setState({ pageRangeInputValue: value });
  }

  keyPressControlInput = ({ key, target: { value } }) => {
    const { size } = this.props;

    if (key === 'Enter' && value && value > 0) {
      if (value > this.state.lastPage) this.goToLastPage();
      this.setState({ pageRangeInputValue: value * size - 9 });
      this.changePage(value);
    }
  }

  keyPressRangeInput = ({ key, target: { value } }) => {
    const { size } = this.props;
    const { totalSize } = this.state;

    if (key === 'Enter' && value && value > 0) {
      if (value > totalSize) this.goToLastPage();
      this.setState({
        pageControlInputValue: Math.ceil(value / size),
        pageRangeInputValue: Math.ceil(value / size) * size - 9
      });
      this.changePage(Math.ceil(value / size));
    }
  }

  getCurrentPageRangeSize = (props) => {
    const { currentPage, size, totalSize } = props;
    return (currentPage * size) >= totalSize ? totalSize : currentPage * size;
  }

  renderInput = (value, onChange, onKeyPress) => {
    const width = (((value + '').length + 1) * 8) + 13 + 'px';

    return (
      <Input
        type="number"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        style={{ width }}
      />
    );
  }

  renderPaginationCompact() {
    return (
      <div className="pagination-compact">
        <IconButton icon="angle double left" onClick={this.goToFirstPage} />
        <IconButton icon="angle left" onClick={this.goToPrevPage} />

        <span className="numbers">
          {this.props.currentPage}/{this.state.numberOfPages}
        </span>

        <IconButton icon="angle right" onClick={this.goToNextPage} />
        <IconButton icon="angle double right" onClick={this.goToLastPage} />
      </div>
    );
  }

  renderPaginationFull() {
    const { totalSize, pageControlInputValue, pageRangeInputValue } = this.state;
    return (
      <div className="pagination-full">
        <Icon name="angle double left" onClick={this.goToFirstPage} />&nbsp;
        <Icon name="angle left" onClick={this.goToPrevPage} />&nbsp;&nbsp;&nbsp;

        <span className="numbers">
          {i18n.t('pagination_page', { defaultValue: 'page' })}&nbsp;&nbsp;&nbsp;&nbsp;
          {this.renderInput(pageControlInputValue, this.changeControlInput, this.keyPressControlInput)}
        </span>&nbsp;&nbsp;&nbsp;

        <Icon name="angle right" onClick={this.goToNextPage} />&nbsp;
        <Icon name="angle double right" onClick={this.goToLastPage} />&nbsp;&nbsp;&nbsp;

        <span>
          {i18n.t('pagination_from', { defaultValue: 'from' })}&nbsp;&nbsp;&nbsp;
          {this.renderInput(pageRangeInputValue, this.changeRangeInput, this.keyPressRangeInput)}&nbsp;&nbsp;&nbsp;
          {i18n.t('pagination_to', { defaultValue: 'to' })}&nbsp;&nbsp;
          {this.state.currentPageRangeSize}&nbsp;&nbsp;
          {i18n.t('pagination_of', { defaultValue: 'of' })}&nbsp;&nbsp;
          {this.state.totalSize}
        </span>
      </div>
    );
  }

  render() {
    if (isNaN(this.state.totalSize) || isUndefined(this.state.totalSize)) return <Loader active inline />;

    return (
      <PaginationStyled className="pagination">
        {this.renderPaginationCompact()}
        {this.renderPaginationFull()}
      </PaginationStyled>
    );
  }
}
