import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash/collection';
import { isEqual } from 'lodash/lang';
import { Header, Divider, Button } from 'semantic-ui-react';

import Rule from './rule';
import Loader from '../../../../../../../shared/loader';
import PlasticineApi from '../../../../../../../../api';
import { parseOptions, getModel } from '../../../../../../../../helpers';

export default class GridRules extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { loading: true, fields: [] };
  }

  async componentDidMount() {
    await this.setContent(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.model, nextProps.record.model)) {
      await this.setContent(nextProps);
    }
  }

  setContent = async (props) => {
    this.setState({ loading: true });

    const result = await PlasticineApi.loadFields(props.record.model);
    const fields = result.data.data;

    this.setState({ loading: false, model: props.record.model, fields });
  }

  handleAddGridRule = (e) => {
    e.preventDefault();
    this.updateGridRule('ADD_RULE');
  }

  updateGridRule = (cmd, i, o) => {
    const defaultRule = {
      italic: false,
      bold: false,
      color: 'rgba(0, 0, 0, 0.87)',
      background_color: 'rgba(255, 255, 255, 1)',
      apply_to: 'row',
      field: '',
      query: '',
    };

    const options = parseOptions(this.props.record.options);
    if (!options.rules) options.rules = [];

    switch (cmd) {
      case 'ADD_RULE':
        options.rules.splice(i + 1, 0, defaultRule);
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'REMOVE_RULE':
        if (!confirm("Are you sure to delete current rule?")) return;
        options.rules.splice(i, 1);
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_QUERY':
        options.rules[i].query = o.query;
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_COLOR':
        options.rules[i].color = o.value;
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_BACKGROUND_COLOR':
        options.rules[i].background_color = o.value;
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_FONT_WEIGHT':
        options.rules[i].bold = !options.rules[i].bold;
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_FONT_STYLE':
        options.rules[i].italic = !options.rules[i].italic;
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_APPLY_TO':
        options.rules[i].apply_to = o.apply_to;
        return this.props.onChange({ options: JSON.stringify(options) });
      case 'CHANGE_FIELD':
        options.rules[i].field = o.field;
        return this.props.onChange({ options: JSON.stringify(options) });
    }
  }

  renderRules = () => {
    if (this.state.loading) return <Loader dimmer={true} />;

    const { record } = this.props;
    const { fields } = this.state;

    const model = getModel(record.model);
    const options = parseOptions(record.options);

    if (!options.rules) options.rules = [];

    return map(options.rules, (rule, index) => {
      return (
        <Rule
          key={index}
          index={index}
          model={model}
          fields={fields}
          rule={rule}
          rulesLength={options.rules.length}
          updateGridRule={this.updateGridRule}
        />
      );
    });
  }

  renderAddRuleButton = () => {
    return <Button basic onClick={this.handleAddGridRule}>Add rule</Button>;
  }

  render() {
    return (
      <div style={{ marginTop: "1em" }}>
        <Header as="h2" floated="left">Rules:</Header>
        <Divider clearing />
        {this.renderRules()}
        <Button basic onClick={this.handleAddGridRule}>Add rule</Button>
      </div>
    );
  }
}
