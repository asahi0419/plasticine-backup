import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import { pick } from 'lodash/object';

import PlasticineApi from '../../../../../api';
import { parseOptions } from '../../../../../helpers';
import connector from '../connector';
import BaseContainer from './base';
import Field from '../../../../../components/content/form/field/types/data-template';
import { DETAILS_ALIASES } from '../../../../../components/content/form/field/types/data-template/constants';

class DataTemplateContainer extends BaseContainer {
  static propTypes = {
    ...BaseContainer.propTypes,
    fields: PropTypes.array.isRequired,
    uiRules: PropTypes.array,
  }

  static defaultProps = {
    uiRules: [],
  }

  componentDidMount() {
    this.openField(true);
  }

  componentWillUnmount() {
    this.props.closeField(this.props.field.id);
  }

  createItem = async (item, setRecord) => {
    const template = (this.context.record.metadata.extra_attributes || {})[this.props.field.alias];

    const selected = {
      alias: `${item.subtype}_${+new Date()}`,
      name: item.name,
      type: item.type,
      model: template,
      virtual: (item.subtype === 'folder') ? true : false,
      required_when_script: 'false',
      readonly_when_script: 'false',
      hidden_when_script: 'false',
      subtype: item.subtype,
    };

    const { attributes } = setRecord(selected);
    const { data: { data } } = await PlasticineApi.createRecord(
      'field',
      { data: { attributes } },
    );

    if (item.subtype === 'folder') data.attributes.children = [];

    return data.attributes;
  }

  updateItem = async (item) => {
    await PlasticineApi.updateRecord(
      'field',
      item.id,
      { data: { attributes: pick(item, DETAILS_ALIASES) } }
    );
  };

  deleteItem = async (item) => {
    await PlasticineApi.updateRecord(
      'field',
      item.id,
      { data: { attributes: { ...pick(item, DETAILS_ALIASES), marked_as_deleted: new Date() } } },
    );
  };

  onChange = async (attributes) => {
    const { field: { model, alias } } = this.props;
    const value = JSON.stringify({ attr: attributes });

    await PlasticineApi.updateRecord(
      model,
      this.context.record.get('id'),
      { data: { attributes: { [alias]: value } } },
    );
    this.props.onChange(_, { value });
  };

  renderPlaceholder() {
    const template = (this.context.record.metadata.extra_attributes || {})[this.props.field.alias];

    const content = template
      ? this.props.ready
        ? i18n.t('configure_fields_to_display', { defaultValue: 'Please configure fields to display' })
        : i18n.t('data_template_loading', { defaultValue: 'Data template loading ...' })
      : i18n.t('finalise_the_record_creation_to_manage_the_field', { defaultValue: 'Please finalise the record creation to manage the field' });

    return <Segment>{content}</Segment>;
  }

  renderContent() {
    const props = this.getProps();

    return (
      <Field
        {...props}
        fields={this.props.fields}
        uiRules={this.props.uiRules}
        createItem={this.createItem}
        updateItem={this.updateItem}
        deleteItem={this.deleteItem}
        onChange={this.onChange}
      />
    );
  }

  renderField() {
    const template = (this.context.record.metadata.extra_attributes || {})[this.props.field.alias];

    return template ? this.renderContent() : this.renderPlaceholder();
  }
}

export default connector(DataTemplateContainer);
