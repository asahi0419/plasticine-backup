import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Loader, Dimmer } from 'semantic-ui-react';
import { findIndex } from 'lodash/array';
import { each, find, filter, some } from 'lodash/collection';
import { set, get } from 'lodash/object';
import { isEmpty } from 'lodash/lang';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../../constants';

const DropdownStyled = styled(Dropdown)`
  max-height: 32px;
  width: 196px;
  padding: 9px 25px 9px 9px !important;

  .text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
  }

  > .menu { max-width: 400px; }

  .dropdown.icon {
    position: absolute !important;
    top: 10px;
    right: 1em !important;
  }

  .item {
    text-overflow: ellipsis;
    overflow: hidden;
    &.reference-field {
      span {
        position: relative;
        margin-left: 20px;

        &::before {
          position: absolute;
          display: block;
          content: '•';
          top: 50%;
          left: -20px;
          font-weight: normal;
          transform: translateY(-50%);
        }
      }
    }

    &.active {
      background-color: rgba(0,0,0,0.03) !important;
    }
  }

  .togglers {
    margin: -1rem 0;
    padding: 1rem 0;

    .header {
      font-size: 12px;
      font-weight: 700;
      margin: 1rem 0 .75rem;
      padding: 0 1.15rem;
      cursor: pointer;
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    width: 100%;
  }
`;

export default class extends Component {
  static propTypes = {
    fields: PropTypes.array.isRequired,
    selected: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    loadTemplateFields: PropTypes.func.isRequired,
    loadReferenceFields: PropTypes.func.isRequired,
    upward: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    const templateFieldsOpened = props.selected.alias.match(/__dvf__/g) && some(props.fields, ({ alias }) => alias.match(/__dvf__/g));
    const referenceFieldsReady = some(props.fields, ({ alias }) => alias.match(/\./g));
    const referenceFieldsOpened = props.selected.alias.match(/\./g) && some(props.fields, ({ alias }) => alias.match(/\./g));

    let templates = {};

    each(props.templates, ({ dvf, dtfs }) => {
      templates[dvf.id] = {};

      each(dtfs, dtf => {
        const matcher = new RegExp(`__dvf__${dvf.alias}/${dtf.alias}`, 'g');
        const open = props.selected.alias.match(matcher);
        const ready = some(props.fields, { dvf: dvf.id, dtf: dtf.id });

        templates[dvf.id][dtf.id] = { open, ready };
      });
    });

    this.state = {
      loading: false,
      templates,
      templateFieldsOpened,
      referenceFieldsReady,
      referenceFieldsOpened,
    };
  }

  componentWillReceiveProps(nextProps) {
    const referenceFieldsReady = some(nextProps.fields, ({ alias }) => alias.match(/\./g));

    const templates = { ...this.state.templates };

    each(nextProps.templates, ({ dvf, dtfs }) => {
      each(dtfs, dtf => {
        set(templates, `[${dvf.id}][${dtf.id}].ready`, some(nextProps.fields, { dvf: dvf.id, dtf: dtf.id }));
      });
    });

    this.setState({
      loading: false,
      templates,
      referenceFieldsReady,
    });
  }

  selectField = (field) => {
    this.props.onChange(null, { value: field.alias });
  }

  loadReferenceFields = (e) => {
    if (e !== undefined) e.stopPropagation();
    this.setState({ loading: 'reference-fields', referenceFieldsOpened: true, templates: this.closeTemplates(this.state.templates) });
    return this.props.loadReferenceFields();
  }

  loadTemplateFields = (e, template) => {
    if (e !== undefined) e.stopPropagation();
    const { dvf, dtf } = template;

    const state = {
      templates: this.switchTemplate(this.state.templates, template),
      referenceFieldsOpened: false,
    };

    if (state.templates[dvf.id][dtf.id].ready) return this.setState({ ...state, loading: false });

    this.setState({ ...state, loading: `template-fields-${dvf.id}-${dtf.id}` });
    return this.props.loadTemplateFields(template);
  }

  switchReferenceFields = (e) => {
    if (e !== undefined) e.stopPropagation();

    this.setState({
      referenceFieldsOpened: !this.state.referenceFieldsOpened,
      templates: this.state.referenceFieldsOpened ? this.state.templates : this.closeTemplates(this.state.templates),
    });
  }

  switchTemplate = (templates, template) => {
    const result = { ...templates };
    each(result, (v, i) => each(v, (t, j) => (result[i][j].open = (((i == template.dvf.id) && (j == template.dtf.id)) ? !result[i][j].open : false))));
    return result
  }

  closeTemplates = (templates) => {
    const result = { ...templates };
    each(result, (v, i) => each(v, (t, j) => (result[i][j].open = false)));
    return result;
  }

  renderItem = (field, i) => {
    const { referenceFieldsOpened } = this.state;
    const { name, referenced, templated, dtf, dvf, nonclickable } = field;
    const referencedClosed = referenced && !referenceFieldsOpened;
    const templateClosed = templated || (dvf && !this.state.templates[dvf][dtf].open);
    const style = referencedClosed || templateClosed ? { display: 'none' } : null;
    const className = referenced ? 'reference-field' : (nonclickable ? 'nonclickable-field' : '');
    const active = name === this.props.selected.name;

    return (
      <Dropdown.Item
        key={i}
        active={active}
        onClick={() => this.selectField(field)}
        content={name}
        className={className}
        style={style}
        title={name}
      />
    );
  }

  renderItems = () => {
    const { templates } = this.props;
    const items = [...this.props.fields];

    each(templates, ({ dvf, dtfs }, i) =>
      each(dtfs, (dtf, j) => {
        const dtfName = `"${dtf.name}"`;
        const dvfName = (templates.length > 1) ? `(${dvf.name})` : '';
        const translationKey = (templates.length > 1) ? 'template_fields_section_name_multiple' : 'template_fields_section_name';
        const name = i18n.t(translationKey, { defaultValue: `${dtfName} fields ${dvfName}`, dtfName, dvfName });
        const nonclickable = { dvf: dvf.id, dtf: dtf.id, nonclickable: true, name };
        const index = findIndex(items, { dvf: dvf.id, dtf: dtf.id });
        items.splice(index, 0, nonclickable);
      })
    );

    return (
      <Dropdown.Menu scrolling>
        {items.map(this.renderItem)}
      </Dropdown.Menu>
    );
  }

  renderLoader = () => {
    return (
      <Dimmer active inverted style={{ padding: 0 }}>
        <Loader size='tiny' inline='centered'/>
      </Dimmer>
    );
  }

  renderReferenceFieldsToggler = () => {
    if (!this.props.loadReferenceFields) return null;

    const referenceFieldsTogglerText = this.state.referenceFieldsOpened
      ? i18n.t('hide_reference_fields', { defaultValue: 'Hide reference fields' })
      : i18n.t('show_reference_fields', { defaultValue: 'Show reference fields' })

    const content = (
      <div>
        {(this.state.loading === 'reference-fields') && this.renderLoader()}
        {referenceFieldsTogglerText}
      </div>
    );

    const onClick = this.state.referenceFieldsReady
      ? this.switchReferenceFields
      : this.loadReferenceFields

    return (
      <Dropdown.Header
        key="show-reference-fields"
        style={{ position: 'relative' }}
        content={content}
        onClick={onClick}
      />
    );
  }

  renderTemplateFieldsLoader = () => {
    const content = i18n.t('show_template_fields_toggler', { defaultValue: 'Show template fields' });

    return (
      <Dropdown.Header
        key="show-template-fields"
        style={{ position: 'relative' }}
        content={content}
        onClick={() => this.setState({ templateFieldsOpened: true })}
      />
    );
  }

  renderTemplateFieldsToggler = () => {
    const { templates } = this.props;

    if (isEmpty(templates)) return;
    if (!this.state.templateFieldsOpened) return this.renderTemplateFieldsLoader();

    const togglers = [];

    each(templates, (template, i) =>
      each(template.dtfs, (dtf, j) => {
        const dtfName = `"${dtf.name}"`;
        const dvfName = (templates.length > 1) ? `(${template.dvf.name})` : '';

        const translationKeyHide = (templates.length > 1) ? 'hide_template_fields_multiple' : 'hide_template_fields';
        const translationKeyShow = (templates.length > 1) ? 'show_template_fields_multiple' : 'show_template_fields';
        const templateFieldsTogglerText = this.state.templates[template.dvf.id][dtf.id].open
          ? i18n.t(translationKeyHide, { defaultValue: `Hide ${dtfName} fields ${dvfName}`, dtfName, dvfName })
          : i18n.t(translationKeyShow, { defaultValue: `Show ${dtfName} fields ${dvfName}`, dtfName, dvfName });

        const loading = `template-fields-${template.dvf.id}-${dtf.id}`;

        const content = (
          <div>
            {(this.state.loading === loading) && this.renderLoader()}
            {templateFieldsTogglerText}
          </div>
        );

        togglers.push(
          <Dropdown.Header
            key={`${i}.${j}`}
            style={{ position: 'relative' }}
            content={content}
            onClick={e => this.loadTemplateFields(e, { dvf: template.dvf, dtf, models: template.models })}
          />
        );
      })
    );

    return togglers;
  }

  renderTogglers() {
    return (
      <div className="togglers" onClick={(e) => e.stopPropagation()}>
        {this.renderReferenceFieldsToggler()}
        {this.renderTemplateFieldsToggler()}
      </div>
    );
  }

  render() {
    const { selected: { name }, upward } = this.props;

    return (
      <DropdownStyled floating button basic className="filter-field-selector icon" upward={upward} text={name} title={name}>
        <Dropdown.Menu>
          {this.renderItems()}
          {this.renderTogglers()}
        </Dropdown.Menu>
      </DropdownStyled>
    );
  }
}
