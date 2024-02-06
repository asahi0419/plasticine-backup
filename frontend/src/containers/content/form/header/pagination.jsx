import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Pagination from '../../../../components/content/form/header/pagination';

class PaginationContainer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    siblings: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  }

  render() {
    const { model, record, siblings, onChange } = this.props;
    const { location } = window;

    return (
      <Pagination
        model={model}
        record={record}
        siblings={siblings}
        onChange={onChange}
        location={location}
      />
    );
  }
}

function mapStateToProps(state) {
  const { view = {} } = state;
  const { content = {} } = view;
  const { params = {} } = content;
  const { siblings = {} } = params;

  return { siblings };
}

export default connect(mapStateToProps, {})(PaginationContainer);
