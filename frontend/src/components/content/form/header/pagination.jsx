import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Icon } from 'semantic-ui-react';
import { isEmpty } from 'lodash/lang';
import styled from 'styled-components';

import history from '../../../../history';
import * as CONSTANTS from '../../../../constants';
import * as HELPERS from '../../../../helpers';

import IconButton from '../../../shared/icon-button';

const HeaderPaginationStyled = styled.div`
  display: flex;

  .icon-button {
    width: 22px;
    font-size: 24px;
    line-height: 24px;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    .icon-button {
      width: 36px;
    }
  }
`;

export default class HeaderPagination extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    siblings: PropTypes.object,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    siblings: {},
  }

  constructor(props) {
    super(props);

    this.state = props.siblings;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEmpty(nextProps.siblings)) {
      this.setState(nextProps.siblings);
    }
  }

  handleKeyDown = (e) => {
    const { model, location } = this.props;
    const { prev_record_id, next_record_id } = this.state;

    if (prev_record_id && e.ctrlKey && (e.keyCode === 37)) {
      history.push(`/${model.alias}/form/${prev_record_id}${location.search}#${HELPERS.makeUniqueID()}`)
    }
    if (next_record_id && e.ctrlKey && (e.keyCode === 39)) {
      history.push(`/${model.alias}/form/${next_record_id}${location.search}#${HELPERS.makeUniqueID()}`)
    }
  }

  renderLink(title, recordId, icon) {
    const { model, onChange, location } = this.props;

    const link = recordId ? `/${model.alias}/form/${recordId}${location.search}#${HELPERS.makeUniqueID()}` : null;
    const onClick = onChange ? (e) => onChange(e, recordId) : null;
    const opacity = recordId ? 1 : 0.4;
    const style = { color: 'inherit', opacity };

    return (
      <IconButton
        link={link}
        icon={`angle ${icon}`}
        title={title}
        style={style}
        onClick={onClick}
      />
    );
  }

  render() {
    const { prev_record_id, next_record_id } = this.state;

    return (
      <HeaderPaginationStyled className="form-pagination">
        {this.renderLink(i18n.t('previous_record', { defaultValue: 'Previous record' }), prev_record_id, 'left')}
        {this.renderLink(i18n.t('next_record', { defaultValue: 'Next record' }), next_record_id, 'right')}
      </HeaderPaginationStyled>
    );
  }
}
