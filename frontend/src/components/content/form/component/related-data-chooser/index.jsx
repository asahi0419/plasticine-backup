import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Header } from 'semantic-ui-react';
import lodash from 'lodash'
import styled from 'styled-components';

import PlasticineApi from '../../../../../api';

import DoubleSidedSelect from '../../../../shared/selectable/double-sided-select';
import ObjectEditor from '../../../../shared/object-editor';
import ConditionField from '../../field/types/condition';

const FIELD_TYPE_COLORS = {
  reference_to_list: '#d3a6bb'
};

const FIELD_TYPES = {
  reference: 'ref',
  global_reference: 'gl_ref',
  reference_to_list: 'rtl'
}

const FIELD_TYPES_NAMES = {
  reference: 'Reference',
  global_reference: 'Global reference',
  reference_to_list: 'RTL'
}

const buildViewName = (model, field, view) => {
  if (field.type === 'reference_to_list') {
    return `${field.name} [${view.name}] (${model.plural || model.name}) RTL`;
  } else {
    return `${model.plural || model.name} [${view.name}] (${field.name})`;
  }
};

const convertForInternalUsage = ({ model, field, view }) => {
  const id = [field.id, model.id, view.id].join('_');

  return {
    text: buildViewName(model, field, view),
    value: id,
    color: FIELD_TYPE_COLORS[field.type],
    position: field.type === 'reference_to_list' ? -1 : 0,
    options: { id, field: field.id, model: model.id, view: view.id },
    type: FIELD_TYPES[field.type],
    condition_script: true
  };
};

const StyledComponentDetails = styled.div`
  .floated .field {
    display: flex;
    align-items: center;
    flex-direction: row !important;
    margin: 0;

    label {
      white-space: nowrap;
      min-width: 100px;
      max-width: 100px;
      width: 100px;
      margin-right: 0 !important;
      display: flex;
      align-items: center;
    }
  }

    .field {
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;

      .condition-field-value {
        display: flex;
        min-height: 32px;

        label {
          min-width: 100px;
          max-width: 100px;
          width: 100px;
          display: flex;
          align-items: center;
          margin-right: 0 !important;
        }

        .ui.dropdown {
          margin-top: 0 !important;
          height: 20px;
        }

        .condition-field-label {
          display: flex;
          align-items: center;
  
          i.code.link.icon {
            height: 20px;
            line-height: 20px;
          }
  
          .condition-string {
            margin-right: 10px;
          }
        }
      }

      .filter-content {
        margin-top: 0;
        margin-left: 0;
  
        .filter-group {
          .filter-item {
            margin-top: 10px;
  
            .filter-item-label {
              display: none;
            }
  
            .filter-item-controls {
              display: grid;
              gap: 10px;
  
              .filter-item-inputs {
                display: flex;
                flex-wrap: wrap;
  
                div:first-child, div:nth-child(2) {
                  min-width: 200px;
                }
  
                .filter-item-value-control {
                  margin-top: 10px;
  
                  .filter-item-value-control {
                    margin: 0;
  
                    div {
                      min-width: 200px;
                    }
                    
                    i.remove-icon {
                      float: right;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .field {
    margin-bottom: 10px;
  }

  .rel-list-details-row {
    display: flex;
    margin-bottom: 10px;
    height: 32px;


    div:first-child {
      min-width: 100px;
      max-width: 100px;
      width: 100px;
      display: flex;
      justify-content: flex-start;
    }

    div:last-child {
      font-weight: bold;
    }
  }
`;

export default class RelatedDataChooser extends Component {
  static propTypes = {
    model: PropTypes.number,
    record: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      active: null,
      model: null,
      items: [],
      fields: [],
      references: [],
    };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (lodash.isEqual(nextProps.model, this.props.model)) return
    this.setContent(nextProps);
  }

  setContent = async (props) => {
    if (props.model) {
      const { data } = await PlasticineApi.fetchRecord('model', props.model)
      const { entities = {} } = await PlasticineApi.normalize(data);

      const model = (entities.model || {})[props.model]
      const references = await PlasticineApi.loadReferences(model.id, props.record.id)
      const fields = await PlasticineApi.loadFields(model.id);
  
      this.setState({
        active: null,
        items: lodash.map(references.data, convertForInternalUsage),
        model,
        fields: fields.data.data,
        references: references.data,
      })
    } else {
      this.setState({
        active: null,
        model: null,
        items: [],
        fields: [],
        references: [],
      })
    }

  }

  handleChange = (items) => {
    const { config } = this.props;
    const { active } = this.state;

    const ids = lodash.map(items, 'value');
    const newItems = this.state.items
      .filter(({ value }) => ids.includes(value))
      .sort((a, b) => ids.indexOf(a.value) - ids.indexOf(b.value));

    if (active && !lodash.filter(items, { value: active.value }).length) {
      this.setState({ active: null });
    }

    this.props.onChange({
      list: lodash.map(newItems, 'options'),
      options: newItems.reduce((result, { value }) => {
        return {
          ...result,
          [value]: {
            condition_script: 'true',
            ...((config.options || {})[value] || {})
          }
        }
      }, {})
    })
  }

  handleClickSelectedItem = (item) => {
    this.setState({ active: item });
  }

  handleOptionsChanged = (data) => {
    this.props.onChange({
      list: this.props.config.list,
      options: {
        ...(this.props.config.options || {}),
        [this.state.active.value]: data
      }
    })
  };

  handleChangeCondition = (e, data) => {
    this.props.onChange({
      list: this.props.config.list,
      options: {
        ...(this.props.config.options || {}),
        [this.state.active.value]: {
          ...((this.props.config.options || {})[this.state.active.value] || {}),
          condition_script: data.value
        }
      },
    })
  }

  renderConditionInput = () => {
    const { config } = this.props;
    const { active, model, fields } = this.state;

    const field = {
      id: active.value,
      name: 'Condition',
      type: 'condition',
      model: model?.id
    }
    const value = config.options[active.value].condition_script

    return (
      <ConditionField
        id={field.id}
        key={field.id}
        onChange={this.handleChangeCondition}
        active={false}
        enabled={true}
        error={false}
        field={field}
        fields={fields}
        inline={false}
        model={model || {}}
        required={false}
        value={value}
      />
    )
  }

  renderEditor = () => {
    const { options = {} } = this.props.config;
    const { active, references } = this.state;
    
    if (!active) return;

    const itemData = lodash.find(
      references,
      reference => reference.field.id === active.options.field
                && reference.model.id === active.options.model
                && reference.view.id === active.options.view
    )

    const data = options[active.value] || {};
    if (!data.name) data.name = active.text;

    return (
      <StyledComponentDetails>
        <Header as="h5">Details</Header>
        <ObjectEditor data={data} onChange={this.handleOptionsChanged}>
          <ObjectEditor.Input name="name" label="Display name" as="text" />
        </ObjectEditor>
        <div className="rel-list-details-row" style={{ marginTop: '10px'}}>
          <div>Field name</div>
          <div>{itemData.field.name}</div>
        </div>
        <div className="rel-list-details-row">
          <div>View name</div>
          <div>{itemData.view.name}</div>
        </div>
        <div className="rel-list-details-row">
          <div>Model name</div>
          <div>{itemData.model.name}</div>
        </div>
        <div className="rel-list-details-row">
          <div>Field type</div>
          <div>{FIELD_TYPES_NAMES[itemData.field.type]}</div>
        </div>
        {this.renderConditionInput()}
      </StyledComponentDetails>
    );
  }

  render() {
    const { list = [] } = this.props.config || [];
    const ids = list.map(({ id }) => id);
    
    const notSelectedItems = ids.length
      ? this.state.items.filter(({ value }) => !ids.includes(value))
      : this.state.items;
    
    const selectedItems = ids.length
      ? this.state.items.filter(({ value }) => ids.includes(value))
        .sort((a, b) => ids.indexOf(a.value) - ids.indexOf(b.value))
      : []

    return (
      <Grid style={{ margin: '0' }}>
        <Grid.Row columns={2}>
          <Grid.Column>
            <DoubleSidedSelect
              leftSideLabel="Available"
              rightSideLabel="Selected"
              items={notSelectedItems}
              selected={selectedItems}
              onChange={this.handleChange}
              onClickSelectedItem={this.handleClickSelectedItem}
              showExtraFilter={true}
            />
          </Grid.Column>
          <Grid.Column>
            {this.renderEditor()}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
