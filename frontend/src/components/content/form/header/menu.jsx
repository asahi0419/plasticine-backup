import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router';
import { isEqual, isEmpty} from 'lodash/lang';
import { compact } from 'lodash/array';
import { find, map, filter, reduce, orderBy } from 'lodash/collection';
import styled from 'styled-components';
import qs from 'qs';

import db from '../../../../db';
import * as HELPERS from '../../../../helpers';
import * as CONSTANTS from '../../../../constants';

import DropdownNestable from '../../../shared/nestable-dropdown';
import { connect } from 'react-redux';

const Menu = styled(DropdownNestable)`
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

class HeaderMenu extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    exportForm: PropTypes.func.isRequired,
    actions: PropTypes.array.isRequired,
    relatedViews: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { open: false };
  }


  handleItemClick = (callback) => () => {
    this.setState({ open: false }, callback);
  }

  handleClickExportToCSV = () => {
    this.props.exportForm({ format: 'csv' });
  }

  renderItem = (item = {}) => {
    const key = HELPERS.makeUniqueID()

    if (!item.enabled) return;

    const options = filter(item.options || [], { enabled: true });

    return options.length
      ? <Dropdown key={key} simple={item.simple} text={item.text} pointing="left" className="link item">
          <Dropdown.Menu>
            {map(options, (option) => {
              return this.renderItem(option)
            })}
          </Dropdown.Menu>
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

  renderConfigItem = (children) => {
    if (!compact(children).length) return;

    return (
      <Dropdown simple text={i18n.t('menu_config', { defaultValue: 'Config' })} pointing="left" className="link item">
        <Dropdown.Menu>
          {children}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  extractFieldsExportOptions = (record, fields=[]) => {
    let fieldsVisibiltyOptions = []
    fields.map((field) => {
      if (!record.isFieldVisible(field.alias)) fieldsVisibiltyOptions = {...fieldsVisibiltyOptions, [field.alias]: { hidden: true }}
    })
    return fieldsVisibiltyOptions;
  }

  renderExportToCSVItem() {
    const onClick = () => this.props.exportForm({ format: 'csv' });
    const text = i18n.t('menu_export_to_csv', { defaultValue: 'Export to CSV' });
    return <Dropdown.Item key="menu_export_to_csv" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToPDFItemPortrait() {
    const onClick = () => {
      const { record } = this.props;
      const { fields=[] } = record.metadata

      const fieldOptions = this.extractFieldsExportOptions(record, fields)
      this.props.exportForm({ format: 'pdf', orientation: 'portrait', fieldOptions: fieldOptions, relatedViews: this.props.relatedViews});
    }
    const text = i18n.t('menu_export_to_pdf_portrait', { defaultValue: 'PDF Portrait' });
    return <Dropdown.Item key="menu_export_to_pdf_portrait" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToPDFItemLandscape() {
    const onClick = () => {
      const { record } = this.props;
      const { fields=[] } = record.metadata

      const fieldOptions = this.extractFieldsExportOptions(record, fields)
      this.props.exportForm({ format: 'pdf', orientation: 'landscape', fieldOptions: fieldOptions, relatedViews: this.props.relatedViews});
    }
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
    const onClick = () => {
      const { record } = this.props;
      const { fields=[] } = record.metadata

      const fieldOptions = this.extractFieldsExportOptions(record, fields)
      this.props.exportForm({ format: 'docx', orientation: 'portrait', fieldOptions: fieldOptions, relatedViews: this.props.relatedViews});
    }
    const text = i18n.t('menu_export_to_docx_portrait', { defaultValue: 'DOCX Portrait' });
    return <Dropdown.Item key="menu_export_to_docx_portrait" onClick={this.handleItemClick(onClick)}>{text}</Dropdown.Item>;
  }

  renderExportToDOCXItemLandscape() {
    const onClick = () => {
      const { record } = this.props;
      const { fields=[] } = record.metadata

      const fieldOptions = this.extractFieldsExportOptions(record, fields)
      this.props.exportForm({ format: 'docx', orientation: 'landscape', fieldOptions: fieldOptions, relatedViews: this.props.relatedViews});
    }
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

  renderExportItem(children) {
    const { configs = {} } = this.props;

    const text = i18n.t('menu_export', { defaultValue: 'Export' });

    return (
      <Dropdown text={text} pointing="left" className="link item">
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const trigger = <Trigger className="menu-trigger"><div>.</div></Trigger>;

    return (
      <Menu trigger={trigger} open={this.state.open}>
        <Dropdown.Menu>
          {this.renderConfigItem([
            this.renderItem({
              enabled: true,
              text: i18n.t('menu_current_form', { defaultValue: 'Current Form' }),
              url: `/form/form/${this.props.form.id}`,
            }),
            this.renderItem(getDefaultEmbedded(this.props)),
            this.renderItem(getDefaultMetadata(this.props)),
          ])}
          {this.renderExportItem([
            this.renderExportToCSVItem(),
            this.renderExportToPDFItem([
              this.renderExportToPDFItemPortrait(),
              this.renderExportToPDFItemLandscape(),
            ]),
            this.renderExportToDOCXItem([
              this.renderExportToDOCXItemPortrait(),
              this.renderExportToDOCXItemLandscape(),
            ]),
          ])}
        </Dropdown.Menu>
      </Menu>
    );
  }
}

function getDefaultEmbedded({ record, model, form, actions }) {
  const { components = {} } = HELPERS.parseOptions(form.options);
  const options = orderBy(reduce(components.options, (result, option = {}) => {
    if (option.embedded_view && option.embedded_view.view) {
      const { view = {} } = option.embedded_view;

      const item = {
        enabled: true,
        text: view.name,
        options: [
          { enabled: true, text: i18n.t('menu_view', { defaultValue: 'View' }), url: `/view/form/${view.id}` },
          { enabled: true, text: i18n.t('menu_layout', { defaultValue: 'Layout' }), url: `/layout/form/${view.layout || 'new'}` },
          { enabled: true, text: i18n.t('menu_filter', { defaultValue: 'Filter' }), url: `/filter/form/${view.filterId || 'new'}` },
          { enabled: true, text: i18n.t('menu_appearance', { defaultValue: 'Appearance' }), url: `/appearance/form/${view.appearance || 'new'}` },
        ],
      }
      
      if (view.type === 'map') {
        const [ appearance = {} ] = db.model('appearance').where({ id: view.appearance });

        item.options = item.options.concat([
          {
            enabled: true,
            text: i18n.t('menu_free_geo_objects', { defaultValue: 'Free geo-objects' }),
            options: [
              {
                enabled: true,
                text: i18n.t('menu_free_geo_objects_all', { defaultValue: 'All' }),
                url: `/free_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance}` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_free_geo_objects_point', { defaultValue: 'Point' }),
                url: `/free_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance} AND \`type\` = 'geo_point'` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_free_geo_objects_line_string', { defaultValue: 'LineString' }),
                url: `/free_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance} AND \`type\` = 'geo_line_string'` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_free_geo_objects_polygon', { defaultValue: 'Polygon' }),
                url: `/free_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance} AND \`type\` = 'geo_polygon'` })}`,
              },
            ],
          },
          {
            enabled: true,
            text: i18n.t('menu_associated_geo_objects', { defaultValue: 'Associated geo-objects' }),
            options: [
              {
                enabled: true,
                text: i18n.t('menu_associated_geo_objects_all', { defaultValue: 'All' }),
                url: `/associated_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance} AND metadata IN (${appearance.geo_metadata})` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_associated_geo_objects_point', { defaultValue: 'Point' }),
                url: `/associated_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance} AND metadata IN (${appearance.geo_metadata}) AND \`metadata\`.\`type\` = 'Point'` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_associated_geo_objects_line_string', { defaultValue: 'LineString' }),
                url: `/associated_geo_object/view/grid/default?${qs.stringify({ filter: `model_id = ${model.id} AND record_id = ${record.id} AND appearance_id = ${view.appearance} AND metadata IN (${appearance.geo_metadata}) AND \`metadata\`.\`type\` = 'LineString'` })}`,
              },
            ],
          },
          {
            enabled: true,
            text: i18n.t('menu_geo_object_properties', { defaultValue: 'Geo-object properties' }),
            options: [
              {
                enabled: true,
                text: i18n.t('menu_geo_object_properties_all', { defaultValue: 'All' }),
                url: `/geo_object_property/view/grid/default?${qs.stringify({ filter: `((model_id IS NULL) AND (record_id IS NULL) AND (appearance_id IS NULL)) OR ((model_id = ${model.id}) AND (record_id IS NULL) AND (appearance_id IS NULL)) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id IS NULL)) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id = ${view.appearance})) OR ((model_id IS NULL) AND (appearance_id = ${view.appearance}))` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_geo_object_properties_point', { defaultValue: 'Point' }),
                url: `/geo_object_property/view/grid/default?${qs.stringify({ filter: `((model_id IS NULL) AND (record_id IS NULL) AND (appearance_id IS NULL) AND (\`type\` = 'geo_point')) OR ((model_id = ${model.id}) AND (record_id IS NULL) AND (appearance_id IS NULL) AND (\`type\` = 'geo_point')) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id IS NULL) AND (\`type\` = 'geo_point')) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id = ${view.appearance}) AND (\`type\` = 'geo_point')) OR ((model_id IS NULL) AND (appearance_id = ${view.appearance}) AND (\`type\` = 'geo_point'))` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_geo_object_properties_line_string', { defaultValue: 'LineString' }),
                url: `/geo_object_property/view/grid/default?${qs.stringify({ filter: `((model_id IS NULL) AND (record_id IS NULL) AND (appearance_id IS NULL) AND (\`type\` = 'geo_line_string')) OR ((model_id = ${model.id}) AND (record_id IS NULL) AND (appearance_id IS NULL) AND (\`type\` = 'geo_line_string')) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id IS NULL) AND (\`type\` = 'geo_line_string')) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id = ${view.appearance}) AND (\`type\` = 'geo_line_string')) OR ((model_id IS NULL) AND (appearance_id = ${view.appearance}) AND (\`type\` = 'geo_line_string'))` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_geo_object_properties_polygon', { defaultValue: 'Polygon' }),
                url: `/geo_object_property/view/grid/default?${qs.stringify({ filter: `((model_id IS NULL) AND (record_id IS NULL) AND (appearance_id IS NULL) AND (\`type\` = 'geo_polygon')) OR ((model_id = ${model.id}) AND (record_id IS NULL) AND (appearance_id IS NULL) AND (\`type\` = 'geo_polygon')) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id IS NULL) AND (\`type\` = 'geo_polygon')) OR ((model_id = ${model.id}) AND (record_id = ${record.id}) AND (appearance_id = ${view.appearance}) AND (\`type\` = 'geo_polygon')) OR ((model_id IS NULL) AND (appearance_id = ${view.appearance}) AND (\`type\` = 'geo_polygon'))` })}`,
              },
            ]
          },
          {
            enabled: true,
            text: i18n.t('menu_geo_metadata', { defaultValue: 'Geo metadata' }),
            options: [
              {
                enabled: true,
                text: i18n.t('menu_geo_metadata_all', { defaultValue: 'All' }),
                url: `/geo_metadata/view/grid/default?${qs.stringify({ filter: `id IN (${appearance.geo_metadata})` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_geo_metadata_point', { defaultValue: 'Point' }),
                url: `/geo_metadata/view/grid/default?${qs.stringify({ filter: `id IN (${appearance.geo_metadata}) AND \`type\` = 'Point'` })}`,
              },
              {
                enabled: true,
                text: i18n.t('menu_geo_metadata_line_string', { defaultValue: 'LineString' }),
                url: `/geo_metadata/view/grid/default?${qs.stringify({ filter: `id IN (${appearance.geo_metadata}) AND \`type\` = 'LineString'` })}`,
              },
            ]
          },
        ])
      }

      result.push(item);
    }

    return result;
  }, []), 'text');

  return {
    enabled: !!find(actions, { alias: 'form_embedded' }) && options.length,
    text: i18n.t('menu_embedded', { defaultValue: 'Embedded' }),
    options,
  };
}

function getDefaultMetadata({ model, form, actions }) {
  const params = qs.stringify({ filter: `model = ${model.id}` });

  return {
    enabled: !!find(actions, { alias: 'form_metadata' }),
    text: i18n.t('menu_metadata', { defaultValue: 'Metadata' }),
    options: [
      { enabled: true, text: i18n.t('menu_model', { defaultValue: 'Model' }),               url: `/model/form/${model.id}` },
      { enabled: true, text: i18n.t('menu_fields', { defaultValue: 'Fields' }),             url: `/field/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_actions', { defaultValue: 'Actions' }),           url: `/action/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_db_rules', { defaultValue: 'DB rules' }),         url: `/db_rule/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_views', { defaultValue: 'Views' }),               url: `/view/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_layouts', { defaultValue: 'Layouts' }),           url: `/layout/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_appearances', { defaultValue: 'Appearances' }),   url: `/appearance/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_filters', { defaultValue: 'Filters' }),           url: `/filter/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_forms', { defaultValue: 'Forms' }),               url: `/form/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_permissions', { defaultValue: 'Permissions' }),   url: `/permission/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_privileges', { defaultValue: 'Privileges' }),     url: `/${model.alias}/privileges` },
      { enabled: true, text: i18n.t('menu_escalation_rules', { defaultValue: 'Escalation Rules' }), url: `/escalation_rule/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_ui_rules', { defaultValue: 'UI rules' }), url: `/ui_rule/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_scheduled_tasks', { defaultValue: 'Scheduled tasks' }), url: `/scheduled_task/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_planned_tasks', { defaultValue: 'Planned tasks' }), url: `/planned_task/view/grid/default?${params}` },
    ],
  };
}
const mapStateToProps = (state) => {
  const { relatedViews } = state.options;

  return { relatedViews };
};
export default connect(mapStateToProps)(HeaderMenu);
