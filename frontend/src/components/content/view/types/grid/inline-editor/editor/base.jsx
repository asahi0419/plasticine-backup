import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'semantic-ui-react';
import { map } from 'lodash/collection';
import { isNil } from 'lodash/lang';
import { compact } from 'lodash/array';
import { throttle } from 'lodash/function';
import { NUMBER_MAX_LENGTH } from '../../../../../../../constants';

export default class BaseEditor extends Component {
  static propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    value: PropTypes.string,
    record: PropTypes.object.isRequired,
    column: PropTypes.object.isRequired,
    onApply: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.handleScrollThrottled = throttle(this.handleScroll, 24);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    if (this.node) {
      this.scrollableNode = this.node.parentNode.getElementsByClassName('table-scroll-container')[0];
    }
    if (this.scrollableNode) {
      this.scrollableNode.addEventListener('scroll', this.handleScrollThrottled);
      this.handleScroll();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    if (this.scrollableNode) this.scrollableNode.removeEventListener('scroll', this.handleScrollThrottled);
  }

  handleScroll = (e) => {
    const target = this.scrollableNode;
    const deltaX = target.clientWidth - (this.props.x - target.scrollLeft + this.node.clientWidth);
    const scrollX = (deltaX < 0) ? target.scrollLeft - deltaX : target.scrollLeft;
    this.setState({ scrollX: scrollX, scrollY: target.scrollTop });
  }

  handleDocumentClick = (e) => {
    if (!this.node) return;

    let classNamesInPath = [];
    e.path.forEach(({ classList }) => {
      if (classList) classNamesInPath = compact([ ...classNamesInPath, ...classList.value.split(' ') ]);
    });

    if ([this.node.className, 'rc-calendar', 'modal', 'reference-field'].some(className => classNamesInPath.includes(className))) return;
    this.handleClose();
  }

  handleDocumentKeyDown = ({ key }) => {
    if (key === 'Escape' || key === 'Esc') {
      this.handleClose();
    } else if (key === 'Enter') {
      this.handleApplyValue();
    }
  }

  movePopupValueCaretAtEnd = (e) => {
    let temp_value = e.target.value;
    e.target.value = '';
    e.target.value = temp_value;
  }

  handleInputChange = (e, { value }) => this.setState({ value });

  handleApplyValue = () => {
    const { column } = this.props;
    const { value } = this.state;
    const attrs = { [column.alias]: value };

    this.props.onApply(attrs);
    this.handleClose();
  }

  handleClose = () => this.props.onClose();

  inputStyle = () => {
    const { width } = this.props;
    return { width, marginRight: '7px', maxWidth: 300 };
  }

  renderInput() {
    const { value } = this.state;
    const {type} = this.props.column;
    return (
      <Input
        value={isNil(value) ? '' : value}
        onChange={this.handleInputChange}
        onFocus={this.movePopupValueCaretAtEnd}
        style={this.inputStyle()}
        maxLength={(type === 'integer') || (type === 'float') ? NUMBER_MAX_LENGTH : ''}
        autoFocus
      />
    );
  }


  render() {
    const { x, y } = this.props;
    const { scrollX, scrollY } = this.state;

    const style = {
      position: 'absolute',
      zIndex: 100,
      display: 'flex',
      left: x - (scrollX || 0) - 1,
      top: y - (scrollY || 0),
      padding: '2px',
      borderRadius: '0.3em',
    };

    const iconStyle = { fontSize: '1.2em', cursor: 'pointer' };

    return (
      <div ref={node => this.node = node} style={style} className="value-popup">
        {this.renderInput()}
        <div className="popup-controls">
          <Icon name="checkmark" onClick={this.handleApplyValue} style={iconStyle} />
          <Icon name="close" onClick={this.handleClose} style={iconStyle} />
        </div>
      </div>
    );
  }
}
