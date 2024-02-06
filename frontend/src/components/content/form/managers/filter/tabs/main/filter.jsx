import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';

import Filter from '../../../../../../shared/filter';
import PlasticineApi from '../../../../../../../api';
import { getModel } from '../../../../../../../helpers';

export default class FilterComponent extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onApply: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { loading: true, fields: [] };
  }

  async componentDidMount() {
    await this.setContent(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.model, nextProps.record.model)) {
      await this.setContent(nextProps);
    }
  }

  setContent = async (props) => {
    this.setState({ loading: true });

    const result = await PlasticineApi.loadFields(props.record.model);
    const fields = result.data.data;

    this.setState({ loading: false, model: props.record.model, fields });
  }

  render() {
    const { record, onApply } = this.props;
    const { fields, loading } = this.state;

    const model = getModel(record.model);

    return (
      <Filter
        model={model}
        filter={record.query}
        fields={fields}
        onApply={onApply}
      />
    );
  }
}
