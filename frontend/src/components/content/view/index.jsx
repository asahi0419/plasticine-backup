import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Divider, Message } from 'semantic-ui-react';

import * as CONSTANTS from '../../../constants';
import * as ViewTypes from './types';

import Header from './header';
import Modals from '../../modals';
import Loader from '../../shared/loader';

import ManagerActionSelector from './managers/action-selector';
import ManagerAutorefresher from './managers/autorefresher';
import ManagerFilter from './managers/filter';
import ManagerHeaderActions from './managers/header-actions';
import ManagerHeaderMenu from './managers/header-menu';
import ManagerHeaderTitle from './managers/header-title';
import ManagerLayout from './managers/layout';
import ManagerPaginator from './managers/paginator';
import ManagerQuicksearch from './managers/quick-search';
import ManagerSorter from './managers/sorter';

const ViewStyled = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .view-content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .view-manager,
  .view-section {
    position: relative;
  }

  .view-section {
    &.top, &.bottom {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
    }

    &.middle {
      flex: 1;
    }

    .view-manager:last-child {
      margin-left: auto;
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    .view-section {
      &.top, &.bottom {
        padding: 18px 0;
      }
    }
  }
`;

export default class View extends Component {
  static contextTypes = {
    sandbox: PropTypes.object,
  }

  render() {
    const View = ViewTypes[this.props.props.view.type];
    if (!View) return null;

    return (
      <ViewStyled className="view">
        <Header {...this.props} className="view-header" sections={{
          left: [ <ManagerHeaderMenu key="hm" {...this.props} />, <ManagerHeaderTitle key="ht"  {...this.props} /> ],
          middle: [ <ManagerQuicksearch key="qs" {...this.props} /> ],
          right: [ <ManagerHeaderActions key="ha" {...this.props} /> ],
        }} />

        <div className="view-content">
          <div className="view-section top">
            <ManagerAutorefresher {...this.props} />
            <ManagerFilter {...this.props} />
            <ManagerLayout {...this.props} />
            <ManagerSorter {...this.props} />
            <ManagerPaginator {...this.props} position="top" />
          </div>

          <div className="view-section middle">
            {this.props.props.error
              ? <Message negative style={{ margin: '14px 0' }}><p>{this.props.props.error}</p></Message>
              : <View {...this.props}>{!this.props.ready && <Loader dimmer={true} />}</View>}
          </div>

          <div className="view-section bottom">
            <ManagerActionSelector {...this.props} />
            <ManagerPaginator {...this.props} position="bottom" />
          </div>
        </div>
      </ViewStyled>
    );
  }
}
