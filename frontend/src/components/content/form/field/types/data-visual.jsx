import React from 'react';
import PropTypes from 'prop-types';
import { map, filter, find } from 'lodash/collection';
import { isEmpty } from 'lodash/lang';

import BaseField from './base';
import { parseOptions } from '../../../../../helpers';

export default class DataVisualField extends BaseField {
  static propTypes = {
    ...BaseField.propTypes,
    template: PropTypes.object.isRequired,
    componentRenderer: PropTypes.func.isRequired,
  }

  static contextTypes = {
    record: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context);

    const template = context.record.assignTemplate(props.field.alias, props.template);
    template.subscribe(this.updateTemplate);

    this.state = { template };
  }

  componentDidMount() {
    this.mounted = true;
  }

  shouldComponentUpdate(nextProps) {
    return true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateTemplate = () => this.mounted && this.setState({ tempate: this.state.template })

  generateComponent = (component, tree, fields) => {
    const field = find(fields, { id: component.f });
    const children = filter(tree, { p: component.f });

    const result = {
      id: field.virtual ? `__section__.${field.alias}` : field.alias,
      params: field.virtual ? { name: field.name, expanded: true } : {},
    };

    if (field.virtual && !isEmpty(children)) {
      result.columns = [{
        id: `__column__.${field.alias}`,
        params: {},
        components: map(children, i => this.generateComponent(i, tree, fields)),
      }];
    }

    return result;
  }

  getSection = () => {
    const { fields } = this.state.template.metadata;
    const { attr: value = [] } = parseOptions(this.props.value);

    const tree = filter(value, ({ f }) => find(fields, { id: f }));
    const parentComponents = filter(tree, ({ p }) => p === -1);
    const components = map(parentComponents, component => this.generateComponent(component, tree, fields));

    return {
      id: `__section__.${this.props.field.alias}`,
      params: { expanded: true },
      columns: [{
        id: `__column__.${this.props.field.alias}`,
        params: {},
        components,
      }],
    };
  }

  render() {
    const { template = {} } = this.state;
    const { model } = template.metadata;

    const section = this.getSection();

    return (
      <div className="data-visual-field">
        {this.props.componentRenderer(template, model, section)}
      </div>
    );
  }
}
