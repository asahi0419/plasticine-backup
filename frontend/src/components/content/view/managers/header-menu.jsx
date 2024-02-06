import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Icon } from 'semantic-ui-react';
import { map, filter } from 'lodash/collection';
import { compact } from 'lodash/array';
import { isEmpty } from 'lodash/lang';
import { Link } from 'react-router';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../constants'

import DropdownNestable from '../../../shared/nestable-dropdown'

import { VIEW_TYPES } from '../../../../constants';

const HeaderMenuManagerStyled = styled(DropdownNestable)`
  .menu {
    width: 140px !important;
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    .menu {
      margin-top: 5px !important;
    }
  }
`;

const Trigger = styled.div`
  display: flex;
  width: 18px;
  height: 36px;
  margin-right: 14px;
  font-family: Icons;
  text-align: center;
  font-size: 22px;
  line-height: 36px;

  > div {
    display: none;
  }

  &:before {
    width: 100%;
  }

  &:after {
    width: 100%;
    content: "\\F0C9";
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    position: relative;
    width: 36px;
    border-radius: 4px;
    margin-right: 10px;
    line-height: 19px;
    font-size: 24px;

    > div {
      display: block;
      width: 100%;
    }

    &:before {
      position: absolute;
      bottom: 20px;
      content: ".";
    }

    &:after {
      bottom: 10px;
      position: absolute;
      content: ".";
    }
  }
`;

export default class HeaderMenuManager extends Component {
  static propTypes = {
    configs: PropTypes.shape({
      withAutorefresh: PropTypes.shape({
        options: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
        rate: PropTypes.number.isRequired,
      }),
      withPaginator: PropTypes.shape({
        options: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
        size: PropTypes.number.isRequired,
        position: PropTypes.array.isRequired,
      }),
      withMetadata: PropTypes.shape({
        options: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
      }),
      withExport: PropTypes.shape({
        enabled: PropTypes.bool.isRequired,
      }),
    }),

    callbacks: PropTypes.shape({
      exportView: PropTypes.func,
      updateUserSettings: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  handleItemClick = (callback) => () => {
    this.setState({ open: false }, callback);
  }

  renderCheckmark = (option, value) => {
    if (option === value) {
      return (
        <Icon
          name="checkmark"
          style={{ marginLeft: 10, marginRight: 0 }}
        />
      );
    }
  }

  renderItem = (item = {}, key) => {
    if (!item.enabled) return;

    const options = filter(item.options || [], { enabled: true });

    return options.length
      ? <Dropdown key={key} simple={item.simple} text={item.text} pointing="left" className="link item">
          <Dropdown.Menu>{map(options, (o, i) => this.renderItem(o, i))}</Dropdown.Menu>
        </Dropdown>
      : <Dropdown.Item
          key={key}
          as={Link}
          to={item.url}
          target="_blank"
          content={item.text}
          onClick={this.handleItemClick()}
        />;
  }

  renderDisplayRecordsItemOptions() {
    const { options, size } = this.props.configs.withPaginator;

    return map(options, (option, i) => {
      const onClick = () => this.props.callbacks.updateUserSettings({ page: { size: option } });
      const checkmark = this.renderCheckmark(option, size);

      return (
        <Dropdown.Item key={i} onClick={this.handleItemClick(onClick)}>
          {option}
          {checkmark}
        </Dropdown.Item>
      );
    });
  }

  renderAutorefreshItemOptions() {
    const { options, rate } = this.props.configs.withAutorefresh;

    return map(options, (option, i) => {
      const onClick = () => this.props.callbacks.updateUserSettings({ autorefresh: { rate: option } });
      const value = option / 60000 < 1 ? option / 1000 : option / 60000;
      const measurement = option / 60000 < 1 ? i18n.t('sec', { defaultValue: 'sec' }) : i18n.t('min', { defaultValue: 'min' });
      const content = option === 0 ? i18n.t('off', { defaultValue: 'off' }) : `${value} ${measurement}`;
      const checkmark = this.renderCheckmark(option, rate);

      return (
        <Dropdown.Item key={i} onClick={this.handleItemClick(onClick)}>
          {content}
          {checkmark}
        </Dropdown.Item>
      );
    });
  }

  renderDisplayRecordsItem() {
    const { configs = {} } = this.props;
    const { withPaginator = {} } = configs;

    if (!withPaginator.enabled) return;
    const text = i18n.t('menu_display_records', { defaultValue: 'Display records' });

    return (
      <Dropdown key="display_records" text={text} pointing="left" className="link item">
        <Dropdown.Menu>{this.renderDisplayRecordsItemOptions()}</Dropdown.Menu>
      </Dropdown>
    );
  }

  renderAutorefreshItem() {
    const { configs = {} } = this.props;
    const { withAutorefresh = {} } = configs;

    if (!withAutorefresh.enabled) return;
    const text = i18n.t('menu_autorefresh', { defaultValue: 'Autorefresh' });

    return (
      <Dropdown key="autorefresh" text={text} pointing="left" className="link item">
        <Dropdown.Menu>{this.renderAutorefreshItemOptions()}</Dropdown.Menu>
      </Dropdown>
    );
  }

  renderMetadataItem() {
    const { configs = {} } = this.props;
    const { withMetadata = {} } = configs;

    return this.renderItem(withMetadata, 'metadata');
  }

  renderExportToCSVItem(viewType) {
    const onClick = () => this.props.callbacks.exportView({ format: 'csv' });
    const text = i18n.t('menu_export_to_csv', { defaultValue: 'Export to CSV' });
    const viewCheck = VIEW_TYPES.includes(viewType);

    return <Dropdown.Item disabled={viewCheck} key="menu_export_to_csv" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToPDFItemPortrait() {
    const onClick = () => this.props.callbacks.exportView({ format: 'pdf', orientation: 'portrait'});
    const text = i18n.t('menu_export_to_pdf_portrait', { defaultValue: 'PDF Portrait' });
    return <Dropdown.Item key="menu_export_to_pdf_portrait" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToPDFItemLandscape() {
    const onClick = () => this.props.callbacks.exportView({ format: 'pdf', orientation: 'landscape' });
    const text = i18n.t('menu_export_to_pdf_landscape', { defaultValue: 'PDF Landscape' })
    return <Dropdown.Item key="menu_export_to_pdf_landscape" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToPDFItem(children) {
    if (isEmpty(compact(children))) return;
    const text = i18n.t('menu_export_to_pdf', { defaultValue: 'Export to PDF' });

    return (
      <Dropdown.Item key="menu_export_to_pdf">
        <Dropdown text={text} pointing="left" className="link item">
          <Dropdown.Menu>{children}</Dropdown.Menu>
        </Dropdown>
      </Dropdown.Item>
    );
  }

  
  renderExportToDOCXItemPortrait() {
    const onClick = () => this.props.callbacks.exportView({ format: 'docx', orientation: 'portrait'});
    const text = i18n.t('menu_export_to_docx_portrait', { defaultValue: 'DOCX Portrait' });
    return <Dropdown.Item key="menu_export_to_docx_portrait" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToDOCXItemLandscape() {
    const onClick = () => this.props.callbacks.exportView({ format: 'docx', orientation: 'landscape' });
    const text = i18n.t('menu_export_to_docx_landscape', { defaultValue: 'DOCX Landscape' })
    return <Dropdown.Item key="menu_export_to_docx_landscape" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToDOCXItem(children) {
    if (isEmpty(compact(children))) return;
    const text = i18n.t('menu_export_to_docx', { defaultValue: 'Export to DOCX' });

    return (
      <Dropdown.Item key="menu_export_to_docx">
        <Dropdown text={text} pointing="left" className="link item">
          <Dropdown.Menu>{children}</Dropdown.Menu>
        </Dropdown>
      </Dropdown.Item>
    );
  }

  renderExportToXSLSXItem(viewType) {
    const onClick = () => this.props.callbacks.exportView({ format: 'xlsx' });
    const text = i18n.t('menu_export_to_xlsx', { defaultValue: 'Export to XLSX' });
    const viewCheck = VIEW_TYPES.includes(viewType);

    return <Dropdown.Item disabled={viewCheck} key="menu_export_to_xlsx" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderConfigItem(children) {
    if (isEmpty(compact(children))) return;
    const text = i18n.t('menu_config', { defaultValue: 'Config' })

    return (
      <Dropdown simple text={text} pointing="left" className="link item">
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    );
  }

  renderExportItem(children) {
    const { configs = {} } = this.props;
    const { withExport = {} } = configs;

    if (!withExport.enabled) return;
    if (isEmpty(compact(children))) return;

    const text = i18n.t('menu_export', { defaultValue: 'Export' });

    return (
      <Dropdown text={text} pointing="left" className="link item">
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    );
  }

  renderManager() {
    const { props = {}, configs = {} } = this.props;
    const { withMetadata } = configs;
    const { view } = props;

    const trigger = <Trigger className="menu-trigger"><div>.</div></Trigger>;

    return (
      <DropdownNestable trigger={trigger} open={this.state.open}>
        <Dropdown.Menu>
          {this.renderConfigItem([
            this.renderItem({
              enabled: true,
              text: i18n.t('menu_current_view', { defaultValue: 'Current View' }),
              options: [
                { enabled: true, text: i18n.t('menu_view', { defaultValue: 'View' }), url: `/view/form/${view.id}` },
                { enabled: true, text: i18n.t('menu_layout', { defaultValue: 'Layout' }), url: `/layout/form/${view.layout || 'new'}` },
                { enabled: true, text: i18n.t('menu_filter', { defaultValue: 'Filter' }), url: `/filter/form/${view.filter || 'new'}` },
                { enabled: true, text: i18n.t('menu_apearance', { defaultValue: 'Appearance' }), url: `/appearance/form/${view.appearance || 'new'}` },
              ]
            }, 'current_view'),
            this.renderItem(withMetadata, 'metadata'),
            this.renderDisplayRecordsItem(),
            this.renderAutorefreshItem(),
          ])}
          {this.renderExportItem([
            this.renderExportToCSVItem(view.type),
            this.renderExportToPDFItem([
              this.renderExportToPDFItemPortrait(),
              this.renderExportToPDFItemLandscape(),
            ]),
            this.renderExportToDOCXItem([
              this.renderExportToDOCXItemPortrait(),
              this.renderExportToDOCXItemLandscape(),
            ]),
            this.renderExportToXSLSXItem(view.type),
          ])}
        </Dropdown.Menu>
      </DropdownNestable>
    );
  }

  render() {
    if (!this.props.configs.showHeaderMenu) return null;

    return (
      <HeaderMenuManagerStyled className="view-manager header-menu-manager">
        {this.renderManager()}
      </HeaderMenuManagerStyled>
    );
  }
}
