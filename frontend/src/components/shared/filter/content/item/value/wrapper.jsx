import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'semantic-ui-react';
import { flatten } from 'lodash/array';
import { isArray } from 'lodash/lang';

const isJSValue = (value) => typeof(value) === 'string' && /^js:.*/.test(value);

export default class extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    value: PropTypes.any,
    compact: PropTypes.bool.isRequired,
    children: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  onChangeProxy = (type, position, _, { value }) => {
    let preparedValue;

    if (type === 'multi') {
      preparedValue = flatten(this.props.value);
      preparedValue[position] = value;
      if (preparedValue[position].length < 3) return;
    } else {
      preparedValue = value;
      if (preparedValue.length < 3) return;
    }

    this.props.onChange(null, { value: preparedValue });
  }

  renderWrappedControl = (type, value, originalComponent, index = 0) => {
    const onChange = this.onChangeProxy.bind(this, type, index);
    const onJSClick = this.handleJSClick.bind(this, type, index);

    if (this.props.type === 'true_stub') return originalComponent;

    const styles = { button: {} };
    if (isJSValue(value)) styles.button.width = '60px'

    const valueModeTogglerText = isJSValue(value)
      ? i18n.t('filter_value_mode_static', { defaultValue: 'Static' })
      : i18n.t('filter_value_mode_js', { defaultValue: 'JS' });

    return (
      <div key={index} className="filter-item-value-control">
        {isJSValue(value) ? <Input value={value} onChange={onChange} /> : originalComponent}
        <Button onClick={onJSClick} style={styles.button}>{valueModeTogglerText}</Button>
      </div>
    );
  }

  renderMultiControl = () => {
    const { children } = this.props;
    const value = flatten(this.props.value);

    return (
      <div style={{ display: 'flex', flex: 1 }}>
        {children.map((item, i) => this.renderWrappedControl('multi', value[i], item, i))}
      </div>
    );
  };

  renderSingleControl = () => {
    const { value, children } = this.props;
    return this.renderWrappedControl('single', value, children);
  }

  handleJSClick = (type, position) => {
    let value;

    if (type === 'multi') {
      value = flatten(this.props.value);
      value[position] = isJSValue(value[position]) ? undefined : 'js:';
    } else {
      value = isJSValue(this.props.value) ? undefined : 'js:';
    }

    this.props.onChange(null, { value });
  }

  render() {
    const { type, compact, children } = this.props;

    const classNames = ['filter-item-value-control'];
    if (compact) classNames.push('compact');

    return (
      <div className={classNames.join(' ')}>
        {isArray(children)
          ? this.renderMultiControl()
          : this.renderSingleControl()}
      </div>
    );
  }
}
