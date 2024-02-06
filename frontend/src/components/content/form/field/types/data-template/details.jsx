import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Button } from 'semantic-ui-react';
import { map, filter, sortBy } from 'lodash/collection';
import { isEmpty } from 'lodash/lang';

import { PRIMARY_ALIASES, DETAILS_ALIASES, DETAILS_VIRTUAL_ALIASES } from './constants';
import * as Fields from '../..';

export default class Details extends Component {
  static propTypes = {
    enabled: PropTypes.bool.isRequired,
    record: PropTypes.object.isRequired,
    hasChildren: PropTypes.bool.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
  }

  handleUpdate = () => {
    this.props.record &&
    this.props.record.sandbox.api.p.record.submit() &&
    this.props.onUpdate();
  }

  renderField = (field) => {
    const { record } = this.props;

    const Field = Fields.getComponent(field.type);
    const value = record.get(field.alias);
    const visible = record.isFieldVisible(field.alias);
    const enabled = record.isFieldEnabled(field.alias);
    const required = record.isFieldRequired(field.alias);
    const error = !!record.getErrors(field.alias).length;
    const onChange = (e, { value }) => record.onChange(field.alias, value);
    const getRecordValue = (fieldAlias) => record.get(fieldAlias);

    return visible && (
      <div key={field.id} style={{ marginBottom: '10px' }}>
        <Field
          field={field}
          fields={[]}
          model={record.metadata.model}
          value={value}
          enabled={enabled}
          required={required}
          onChange={onChange}
          getRecordValue={getRecordValue}
          error={error}
        />
      </div>
    );
  }

  getFields = () => {
    const { record } = this.props;
    if (!record) return;

    const optionsIndex = DETAILS_ALIASES.indexOf('options');
    const aliases = record.attributes.virtual
      ? DETAILS_VIRTUAL_ALIASES
      : filter([
        ...DETAILS_ALIASES.slice(0, optionsIndex),
        ...map(record.metadata.options, 'alias'),
        ...DETAILS_ALIASES.slice(optionsIndex, DETAILS_ALIASES.length),
      ], (alias) => (alias !== 'options'));

    const filtered = filter(record.metadata.fields, (field) => record.attributes.virtual
      ? DETAILS_VIRTUAL_ALIASES.includes(field.alias)
      : !PRIMARY_ALIASES.includes(field.alias) && (field.alias !== 'options'));

    const fields = sortBy(filtered, (field) => aliases.indexOf(field.alias));

    return map(fields, this.renderField)
  }

  renderControls() {
    const { record, hasChildren, onDelete, onUpdate } = this.props;

    const style = { display: 'flex', flexDirection: 'row-reverse', paddingTop: '10px', height: '43px' };

    return (
      <div style={style} className="control-buttons">
        <Button basic className="delete" onClick={onDelete} disabled={hasChildren}>Delete</Button>
        <Button basic className="update" onClick={this.handleUpdate}>Update</Button>
      </div>
    );
  }

  renderBody() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            {this.getFields()}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  render() {
    const { record, enabled } = this.props;

    if (!enabled || isEmpty(record) || record.template) return null;

    return (
      <div className="details">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', minHeight: '100%' }}>
          {this.renderBody()}
          {this.renderControls()}
        </div>
      </div>
    );
  }
}
