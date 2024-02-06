import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Sorter from '../../../shared/sorter';

export default class SorterManager extends Component {
  static propTypes = {
    props: PropTypes.shape({
      fields: PropTypes.array.isRequired,
      records: PropTypes.array,
      viewOptions: PropTypes.object.isRequired,
    }),

    configs: PropTypes.shape({
      showSorterManager: PropTypes.bool,
    }),

    callbacks: PropTypes.shape({
      updateView: PropTypes.func.isRequired,
    }),
  }

  constructor(props) {
    super(props);

    this.state = { records: this.props.props.records };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.ready) return;

    this.setState({ records: nextProps.props.records });
  }

  renderManager = () => {
    const { records = [] } = this.state;
    const { props = {}, callbacks = {}, children } = this.props;
    const { fields, viewOptions } = props;
    const { updateView } = callbacks;

    if (!records.length && !children) return;

    return (
      <Sorter
        fields={fields}
        viewOptions={viewOptions}
        updateView={updateView}
      />
    );
  }

  render() {
    if (!this.props.configs.showSorterManager) return null;

    return (
      <div className="view-manager sorter">
        {this.renderManager()}
      </div>
    );
  }
}
