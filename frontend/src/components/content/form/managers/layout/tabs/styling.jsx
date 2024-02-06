import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Form } from 'semantic-ui-react';

import ColorPicker from '../../../../../shared/inputs/colorpicker';

export default class StylingTab extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleChange = (options) => {
    const { record, onChange } = this.props;

    onChange({ options: { ...record.options, card_style: { ...record.options.card_style, ...options } } });
  }

  render() {
    const { record: { options: { card_style = {} } } } = this.props;

    return (
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Form.Input
              label={"Card width" + (card_style.show_as_carousel ? " (could be changed according to page width)" : '')}
              value={card_style.width}
              onChange={(_, { value }) => this.handleChange({ width: value })}
            />
            <Form.Field inline={false}>
              <ColorPicker
                label="Color"
                color={card_style.color}
                onChange={(_, { value }) => this.handleChange({ color: value })}
              />
            </Form.Field>
            <Form.Checkbox
              label="Border"
              checked={card_style.border}
              onChange={(_, { checked }) => this.handleChange({ border: checked })}
              style={{ marginBottom: 0, height: '51px' }}
            />
            <Form.Field inline={false}>
              <ColorPicker
                label="Border color"
                color={card_style.border_color}
                onChange={(_, { value }) => this.handleChange({ border_color: value })}
              />
            </Form.Field>
            <Form.Checkbox
              label="Show as carousel"
              checked={card_style.show_as_carousel}
              onChange={(_, { checked }) => this.handleChange({ show_as_carousel: checked })}
              style={{ marginBottom: 0, height: '51px' }}
            />
          </Grid.Column>
          <Grid.Column>
            <Form.Input
              label="Font size (em)"
              value={card_style.font_size}
              onChange={(_, { value }) => this.handleChange({ font_size: value })}
            />
            <Form.Input
              label="Padding"
              value={card_style.padding}
              onChange={(_, { value }) => this.handleChange({ padding: value })}
            />
            <Form.Input
              label="Border width (px)"
              value={card_style.border_width}
              onChange={(_, { value }) => this.handleChange({ border_width: value })}
            />
            <Form.Field inline={false}>
              <ColorPicker
                label="Background color"
                color={card_style.background_color}
                onChange={(_, { value }) => this.handleChange({ background_color: value })}
              />
            </Form.Field>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
