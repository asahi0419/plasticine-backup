import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Header, Icon } from 'semantic-ui-react';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../constants';
import * as HELPERS from '../../../../helpers';

const HeaderTitleManagerStyled = styled.div`
  display: flex;
  align-items: center;

  i.icon {
    opacity: 1 ;
    margin-right: 0.5em;
  }

  .ui.header {
    margin: 0;
    font-size: 1em;
    display: flex;
    flex-flow: column;
    justify-content: center;
    overflow: hidden;
    white-space: nowrap;
  }

  .ui.header > * {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .ui.header .icon {
    opacity: 0.4;
  }
`;

export default class HeaderTitleManager extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      view: PropTypes.object.isRequired,
      viewOptions: PropTypes.object.isRequired,
    }),
    configs: PropTypes.shape({
      showModelName: PropTypes.bool.isRequired,
      withCellEdit: PropTypes.bool,
    }),
    callbacks: PropTypes.shape({
      updateView: PropTypes.func.isRequired,
    }),
  }

  static defaultProps = {
    showModelName: true,
  }

  renderEditableIcon = () => {
    return (this.props.props.view.type === 'grid') && this.props.configs.withCellEdit
      ? <Icon name="pencil" title={i18n.t('cells_are_editable', { defaultValue: 'Cells are editable' })} />
      : <Icon name="lock" title={i18n.t('cells_are_not_editable', { defaultValue: 'Cells are not editable' })} />;
  }

  renderLink = () => {
    const { props = {}, callbacks = {} } = this.props;
    const { view, viewOptions = {} } = props;
    const { name, exec_by = {} } = viewOptions;

    const { pathname, search } = window.location;
    const style = { cursor: 'pointer' }
    const title = i18n.t('refresh_current_page', { defaultValue: 'Refresh current page' });
    const refreshId = `#${HELPERS.makeUniqueID()}`;
    const url = (exec_by.type === 'main_view') ? [pathname, search, refreshId].join('') : null;
    const handleClick = (exec_by.type === 'main_view') ? () => {} : callbacks.updateView.bind(this, { refreshId });

    return (
      <Link to={url} style={style} title={title} onClick={handleClick}>
        {HELPERS.trimString(name || view.name, CONSTANTS.UI_VIEW_NAME_LEN)}
      </Link>
    );
  }

  renderManager() {
    const { props = {}, configs = {} } = this.props;
    const { model, viewOptions = {} } = props;
    const { showModelName } = configs;

    const modelName = (showModelName && !viewOptions.name)
      ? model.plural || model.name
      : '';

    return (
      <Header as="h2" title={modelName}>
        <span>
          {HELPERS.trimString(modelName, CONSTANTS.UI_MODEL_NAME_LEN)}
        </span>
        <span>
          {this.renderEditableIcon()}
          {this.renderLink()}
        </span>
      </Header>
    );
  }

  render() {
    return (
      <HeaderTitleManagerStyled className="view-manager header-title-manager">
        {this.renderManager()}
      </HeaderTitleManagerStyled>
    );
  }
}
