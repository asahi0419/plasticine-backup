import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { values } from 'lodash/object';

import DashboardTab from '../../../../components/content/form/managers/shared/tabs/dashboard';

class DashboardTabContainer extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    models: PropTypes.array.isRequired,
    views: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  render() {
    const { record, models, views, onChange } = this.props;

    return (
      <DashboardTab
        record={record}
        models={models}
        views={views}
        onChange={onChange}
      />
    );
  }
}

function mapStateToProps(state) {
  const appMetadata = state.metadata.app;

  const models = values(appMetadata.model);
  const views = values(appMetadata.view);

  return { models, views };
}

export default connect(mapStateToProps, {})(DashboardTabContainer);
