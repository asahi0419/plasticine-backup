import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import styled from 'styled-components';
import moment from 'moment';
import { isEqual } from 'lodash/lang';
import { keyBy, map } from 'lodash/collection';

import PlasticineApi from '../../api';
import Loader from './loader';
import * as CONSTANTS from '../../constants';

const WorklogStyled = styled.div`
  position: relative;
  height: 200px;
  padding: 7px 9px;
  border-radius: 5px;
  overflow: hidden;
  overflow-y: auto;

  .worklog-item {
    position: relative;
    margin-bottom: 7px;

    &:last-child {
      margin-bottom: 0;
      border-bottom: none;
    }

    .info {
      margin-bottom: 3px;

      .date, .user {
        display: inline-block;

        &:hover {
          text-decoration: underline !important;
        }

        &.noaccess {
          &:hover {
            text-decoration: none !important;
          }
        }
      }

      .date {
        margin-right: 10px;
      }
    }

    .content {
      margin-bottom: 7px;
    }
  }
`;

export default class Worklog extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    options: PropTypes.object,
  }

  static defaultProps = {
    options: {},
  }

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      items: [],
      users: [],
      hash: window.location.hash,
    };
  }

  async componentDidMount() {
    await this.loadContent(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.hash, window.location.hash)) {
      await this.loadContent(nextProps);
    }
  }

  loadContent = async (props) => {
    this.setState({ ready: false });

    const { model, record, options } = props;
    const { data: { users, items } } = await PlasticineApi.loadWorklog(model.alias, record.id, options);

    this.setState({
      ready: true,
      users,
      items,
      hash: window.location.hash,
    });
  }

  renderItems = () => {
    return this.state.items.map((item, i) => {
      return (
        <div key={i} className="worklog-item">
          {this.renderItemInfo(item)}
          {this.renderItemContent(item)}
        </div>
      );
    });
  }

  renderItemInfo = (item) => {
    const { model } = this.props;
    const { users } = this.state;

    const dateLink = item.id ? `/${item.type}_${model.id}/form/${item.id}` : '';
    const dateClassName = item.id ? 'date' : 'date noaccess';
    const dateTitle = i18n.t('show_referenced_audit_record_in_new_tab', { defaultValue: 'Click to show referenced audit record in new tab' });

    const user = keyBy(users, 'id')[item.created_by] || { name: item.created_by, id: item.created_by };
    const userLink = user.__access ? `/user/form/${user.id}` : '';
    const userClassName = user.__access ? 'user' : 'user noaccess';
    const userTitle = i18n.t('show_referenced_user_record_in_new_tab', { defaultValue: 'Click to show referenced user record in new tab' });

    return (
      <div className="info">
        <Link target="_blank" title={dateTitle} className={dateClassName} to={dateLink}>{moment(item.created_at).format(CONSTANTS.DEFAULT_DATE_FORMAT)}</Link>
        <Link target="_blank" title={userTitle} className={userClassName} to={userLink}>{user.name} {user.surname}</Link>
      </div>
    );
  }

  renderItemContent = (item = {}) => {
    return (
      <div className="content">
        {item.data}
      </div>
    );
  }

  renderLoader = () => {
    if (this.state.ready) return;
    return <Loader dimmer={true} />;
  }

  render() {
    return (
      <WorklogStyled className="worklog">
        {this.renderItems()}
        {this.renderLoader()}
      </WorklogStyled>
    );
  }
}
