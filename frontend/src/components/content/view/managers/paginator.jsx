import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Pagination from '../../../shared/pagination';

export default class PaginatorManager extends Component {
  static propTypes = {
    position: PropTypes.string.isRequired,

    props: PropTypes.shape({
      records: PropTypes.array,
      viewOptions: PropTypes.object.isRequired,
    }),

    configs: PropTypes.shape({
      withPaginator: PropTypes.shape({
        options: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
        position: PropTypes.array.isRequired,
        size: PropTypes.number.isRequired,
      }),
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
    const { ready, props = {}, callbacks = {} } = this.props;
    const { viewOptions = {} } = props;
    const { updateView } = callbacks;
    const { page = {} } = viewOptions;

    const size = ready ? +page.size : NaN;
    const totalSize = ready ? +page.totalSize : NaN;
    const currentPage = ready ? +page.number : NaN;

    if (!records.length) return;

    return (
      <Pagination
        size={size}
        totalSize={totalSize}
        currentPage={currentPage}
        onPageChanged={updateView}
      />
    );
  }

  render() {
    const { position, configs = {}, props = {} } = this.props;
    const { withPaginator = {} } = configs;

    if (!withPaginator.enabled) return null;
    if (!withPaginator.position.includes(position)) return null;

    return (
      <div className="view-manager pagination" style={{ padding: '0 0 0 10px' }}>
        {this.renderManager()}
      </div>
    );
  }
}
