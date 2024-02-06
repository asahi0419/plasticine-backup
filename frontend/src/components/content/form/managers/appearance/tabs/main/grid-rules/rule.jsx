import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Checkbox, Grid, Icon } from 'semantic-ui-react';

import Reference from '../../../../../../../shared/inputs/reference';
import Filter from '../../../../../../../shared/filter';
import ColorPicker from '../../../../../../../shared/inputs/colorpicker';

const ruleLabel = {
  display: "inline-block",
  margin: "0 .4em .4em 0",
  fontSize: ".9em",
  fontWeight: "bold"
};

export default class GridRule extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    rulesLength: PropTypes.number.isRequired,
    rule: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    updateGridRule: PropTypes.func.isRequired,
  }

  handleUpdate = (command, value) => this.props.updateGridRule(command, this.props.index, value)

  handleAddRule = () => this.handleUpdate('ADD_RULE')
  handleRemoveRule = () => this.handleUpdate('REMOVE_RULE')
  handleChangeRule = (query) => this.handleUpdate('CHANGE_QUERY', { query })
  handleChangeColor = (e, { value }) => this.handleUpdate('CHANGE_COLOR', { value })
  handleChangeBackgroundColor = (e, { value }) => this.handleUpdate('CHANGE_BACKGROUND_COLOR',  { value })
  handleChangeFontWeight = () => this.handleUpdate('CHANGE_FONT_WEIGHT')
  handleChangeFontStyle = () => this.handleUpdate('CHANGE_FONT_STYLE')
  handleChangeApplyTo = (e, { value }) => this.handleUpdate('CHANGE_APPLY_TO', { apply_to: value })
  handleChangeField = (e, { value }) => {
    const field = this.props.fields.find(({ id }) => id === value) ? value : '';
    this.handleUpdate('CHANGE_FIELD', { field });
  }

  renderFilter = () => {
    const { rule, model, fields } = this.props;

    return (
      <div style={{ margin: '0 0 1em' }}>
        <label style={ruleLabel}>Rule:</label>
        <Filter
          model={model}
          filter={rule.query || ""}
          fields={fields}
          onApply={this.handleChangeRule}
        />
      </div>
    );
  }

  renderApplyingFields = () => {
    const { rule, model } = this.props;

    return (
      <Grid.Row columns={3} style={{ paddingTop: 0 }}>
        <Grid.Column>
          <Form.Select
            inline={true}
            label="Apply to"
            value={rule.apply_to}
            options={[{ text: "Row", value: 'row' }, { text: "Column", value: 'column' }]}
            onChange={this.handleChangeApplyTo}
          />
        </Grid.Column>
        <Grid.Column>
          {rule.apply_to === 'column' ?
          <Reference
            name="Field"
            value={rule.field}
            config={{
              foreignModel: 'field',
              label: 'name',
              view: 'default',
              form: 'default',
              filter: `model = ${model.id}`,
            }}
            inline={true}
            onChange={this.handleChangeField}
          /> : null}
        </Grid.Column>
        <Grid.Column style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Icon title="Delete current rule" name="trash" color="red" style={{ marginLeft: 5, position: 'relative', top: 6, fontSize: '28px', cursor: 'pointer' }} onClick={this.handleRemoveRule} />
          <Button title="Add new rule" basic style={{ padding: '.8em 1em .8em' }} onClick={this.handleAddRule}>+</Button>
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderStylingFields = () => {
    const { rule } = this.props;

    const previewTextStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '32px',
      width: '120px',
      border: '1px solid rgba(34,36,38,.15)',
      borderRadius: '.3rem',
      color: rule.color,
      backgroundColor: rule.background_color,
      fontWeight: rule.bold ? 'bold' : 'normal',
      fontStyle: rule.italic ? 'italic' : 'normal',
    };

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column computer={2}>
            <div style={previewTextStyle}>Text style</div>
          </Grid.Column>
          <Grid.Column computer={5} style={{ margin: '-2px 0 0 -75px' }}>
            <Form.Field inline={true}>
              <ColorPicker
                label="Color"
                color={rule.color}
                onChange={this.handleChangeColor}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column computer={5} style={{ margin: '-2px 0 0 -40px' }}>
            <Form.Field inline={true}>
              <ColorPicker
                label="Background color"
                color={rule.background_color}
                onChange={this.handleChangeBackgroundColor}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column computer={3} style={{ margin: '-1px 0 0 -120px' }}>
            <Form.Field inline={true}>
              <Checkbox
                label="Bold"
                checked={!!rule.bold}
                onChange={this.handleChangeFontWeight}
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column computer={3} style={{ margin: '-1px 0 0 -65px' }}>
            <Form.Field inline={true}>
              <Checkbox
                label="Italic"
                checked={!!rule.italic}
                onChange={this.handleChangeFontStyle}
              />
            </Form.Field>
          </Grid.Column>
        </Grid.Row>
        {this.renderApplyingFields()}
      </Grid>
    );
  }

  renderDivider = () => {
    const style = {
      margin: '1em 0',
      height: 3,
      background: 'repeating-linear-gradient( 90deg, #d2d3d3, #d2d3d3 10px, #808080 10px, #808080 20px)'
    };

    return <div style={style} />;
  }

  render() {
    const { index, rulesLength } = this.props;

    return (
      <div style={{ margin: "1em 0" }}>
        {this.renderFilter()}
        {this.renderStylingFields()}
        {index + 1 !== rulesLength && this.renderDivider()}
      </div>
    );
  }
}
