import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Header } from 'semantic-ui-react';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../constants';
import * as HELPERS from '../../../../helpers';

const HeaderTitleStyled = styled.div`
  display: flex;
  align-items: center;
  margin: 0 12px 0 18px;

  .header {
    display: flex;
    justify-content: center;
    flex-flow: column;
    line-height: 18px;
    font-size: 1em !important;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    margin: 0 14px;
  }
`;

export default class HeaderTitle extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
  }

  renderRefreshLink(anchor, mode) {
    const { pathname, search } = window.location;

    const url = `${pathname}${search}#${HELPERS.makeUniqueID()}`;
    const title = i18n.t('refresh_current_page', { defaultValue: 'Refresh current page' });
    const style = { cursor: 'pointer' };

    return (
      <Link to={url} style={style} title={title}>
        {anchor}
      </Link>
    );
  }

  renderRefreshControl(anchor, mode) {
    const title = i18n.t('refresh_current_page', { defaultValue: 'Refresh current page' });
    const style = { cursor: 'pointer' };
    const onClick = this.props.callbacks.refresh;

    return (
      <Link style={style} title={title} onClick={onClick}>
        {anchor}
      </Link>
    );
  }

  renderRecordLink(anchor) {
    const { model } = this.props;
    const modelAlias = model.alias;
    const recordId = anchor.replace('#', '');

    const url = `/${modelAlias}/form/${recordId}`;
    const title = i18n.t('open_full_form', { defaultValue: 'Open full form' });
    const style = { cursor: 'pointer' };

    return (
      <Link to={url} target={"_blank"} style={style} title={title}>
        {anchor}
      </Link>
    );
  }

  renderLink(anchor) {
    if (!anchor) return 
    const { mode } = this.props

    if (mode === 'full-popup') {
      return this.renderRefreshControl(anchor)
    }

    if (mode === 'preview') {
      return this.renderRecordLink(anchor)
    }

    return this.renderRefreshLink(anchor, mode)
  }

  render() {
    const { model, record, form = {} } = this.props;
    const { title } = form;

    const getFormName = () => form.use_form_name
      ? form.name
      : record.metadata.inserted ? model.name : `New ${model.name}`;

    const getFormNameTrimmed = () => form.use_form_name
      ? HELPERS.trimString(form.name, CONSTANTS.UI_FORM_NAME_LEN)
      : HELPERS.trimString(record.metadata.inserted ? model.name : `New ${model.name}`, CONSTANTS.UI_MODEL_NAME_LEN);

    return (
      <HeaderTitleStyled className="title">
        <Header as="h2" title={getFormName()}>
          <span>{title ? getFormNameTrimmed() : this.renderLink(getFormNameTrimmed())}</span>
          {this.renderLink(HELPERS.replaceAliasesToValues(title, record))}
        </Header>
      </HeaderTitleStyled>
    );
  }
}
