import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { omit, pick } from 'lodash/object';
import { isEqual } from 'lodash/lang';

import store from '../../../../../store';

export default class BaseContainer extends Component {
  static propTypes = {
    ready: PropTypes.bool.isRequired,

    model: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,

    loadField: PropTypes.func.isRequired,
    openField: PropTypes.func.isRequired,
    closeField: PropTypes.func.isRequired,
  }

  static contextTypes = {
    record: PropTypes.object.isRequired,
  }

  static changeableProps = ['field', 'ready', 'enabled', 'value'];

  componentDidMount() {
    this.openField();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { changeableProps } = this.constructor;

    return !isEqual(
      pick(this.props, changeableProps),
      pick(nextProps, changeableProps),
    );
  }

  openField(reload) {
    const { model, field } = this.props;
    const state = store.redux.instance.getState();
    if (!reload && state.view.field[field.id]) return;

    const recordId = this.context.record.get('id');
    const value = this.context.record.get(field.alias);

    this.props.openField(model.alias, { field, recordId, value }, this.props.loadField);
  }

  reloadField = () => {
    this.openField(true);
  }

  getProps() {
    return omit(this.props, ['ready', 'loadField', 'openField', 'closeField']);
  }

  render() {
    return this.props.ready ? this.renderField() : this.renderPlaceholder();
  }
}
