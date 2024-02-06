import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { filter } from 'lodash/collection';
import { compact } from 'lodash/array';
import { isEqual, isEmpty } from 'lodash/lang';
import styled from 'styled-components';

import history from '../../../../history';
import * as CONSTANTS from '../../../../constants';

import Menu from './menu';
import Title from './title';
import IconButton from '../../../shared/icon-button';
import ActionsBar from '../../action/actions-bar';
import ContextMenu from '../../../shared/context-menu';
import PaginationContainer from '../../../../containers/content/form/header/pagination';

const ContextMenuStyled = styled.div`
  width: 100%;
  height: 60px;
  margin: -15px 0;

  .react-contextmenu-wrapper {
    height: 100%;
  }
`;

const HeaderStyled = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 0;

  .go-back-button {
    width: 18px;
    margin-right: 12px;
  }

  > .header-section {
    display: flex;
    align-items: center;
  }

  > .header-section-m {
    flex: 1;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    padding: 18px 0;

    .go-back-button {
      width: 36px;
      margin-right: 10px;
    }

    .icon-button {
      margin-right: 10px;
    }
  }
`;

export default class Header extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    actions: PropTypes.array,
    menu: PropTypes.bool,
    actionsBar: PropTypes.bool,
    mode: PropTypes.string,
    callbacks: PropTypes.shape({
      exportForm: PropTypes.func,
      handleAction: PropTypes.func,
      goBack: PropTypes.func,
      refresh: PropTypes.func,
      changeRecord: PropTypes.func,
    }),
  }

  static defaultProps = {
    actions: [],
    menu: true,
    actionsBar: true,
  }

  constructor(props) {
    super(props);

    this.state = { record: props.record };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.record.metadata.hasOwnProperty('inserted')) return;

    if (!isEqual(this.props.record.id, nextProps.record.id)) {
      this.setState({ record: nextProps.record });
    }
  }

  shouldComponentUpdate(nextProps) {
    return !isEmpty(nextProps.record.attributes);
  }

  renderGoBack = () => {
    const props = {
      icon: 'arrow left',
      title: i18n.t('go_back', { defaultValue: 'Go back' }),
      className: 'go-back-button',
    };

    this.props.callbacks.goBack
      ? props.onClick = this.props.callbacks.goBack
      : props.link = history.goBack({ push: false });

    return <IconButton {...props} />
  }

  renderMenu() {
    const { menu, model, form, callbacks } = this.props;
    const { exportForm } = callbacks;
    const { record } = this.state;
    if (!menu) return;
    if (!exportForm) return;

    const actions = filter(this.props.actions, { type: 'form_menu_item' });

    return (
      <Menu
        model={model}
        form={form}
        exportForm={exportForm}
        actions={actions}
        record={record}
      />
    );
  }

  renderTitle() {
    const { model, form, menu, callbacks, mode } = this.props;
    const { record } = this.state;

    return (
      <Title
        model={model}
        record={record}
        form={form}
        menu={menu}
        callbacks={callbacks}
        mode={mode}
      />
    );
  }

  renderPagination() {
    const { model, mode, callbacks } = this.props;
    const { record } = this.state;

    if (!record.metadata.inserted) return;
    if (mode === 'full-popup') return;
    if (mode === 'preview') return <Icon name="eye" size="large"/>;

    return (
      <PaginationContainer
        model={model}
        record={record}
        onChange={callbacks.changeRecord}
      />
    );
  }

  renderContextMenu() {
    const { model, callbacks = {} } = this.props;
    const { record } = this.state;
    const { handleAction } = callbacks;

    const actions = filter(this.props.actions, { type: 'context_menu' });

    return (
      <ContextMenuStyled>
        <ContextMenu model={model} record={record} actions={actions} handleAction={handleAction}>
          <div/>
        </ContextMenu>
      </ContextMenuStyled>
    );
  }

  renderActionsBar() {
    const { model, actionsBar, mode, callbacks = {} } = this.props;
    const { record } = this.state;
    const { handleAction } = callbacks;

    if (!actionsBar) return;
    if (!handleAction) return;
    if (mode === 'preview') return;

    const actions = filter(this.props.actions, (a = {}) => {
      const whenType = record.metadata.inserted ? 'update' : 'insert';
      const wnenRule = a[`on_${whenType}`];
      return a.group || (['form_button'].includes(a.type) && wnenRule);
    });

    return (
      <ActionsBar
        record={record}
        model={model}
        actions={actions}
        handleAction={handleAction}
        context="form"
      />
    );
  }

  renderSectionL() {
    return (
      <div className="header-section header-section-l">
        {this.renderGoBack()}
        {this.renderMenu()}
        {this.renderTitle()}
        {this.renderPagination()}
      </div>
    );
  }

  renderSectionM() {
    return (
      <div className="header-section header-section-m">
        {this.renderContextMenu()}
      </div>
    );
  }

  renderSectionR() {
    return (
      <div className="header-section header-section-r">
        {this.renderActionsBar()}
      </div>
    );
  }

  render() {
    const className = compact([this.props.className, 'header']).join(' ');

    return (
      <HeaderStyled className={className}>
        {this.renderSectionL()}
        {this.renderSectionM()}
        {this.renderSectionR()}
      </HeaderStyled>
    );
  }
}
