import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash/object';
import { connect } from 'react-redux';

import Field from '../../../../../components/content/form/field/types/reference-to-list';

class ReferenceToListContainer extends React.Component {
  static propTypes = {
    limit: PropTypes.number.isRequired,
  }

  render() {
    return <Field {...this.props} />;
  }
}

const mapStateToProps = (state) => {
  return { limit: get(state.app.settings, 'limits.rtl_select_field') };
};

export default connect(mapStateToProps)(ReferenceToListContainer);
