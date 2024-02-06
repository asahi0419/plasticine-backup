import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Divider, Icon } from 'semantic-ui-react';
import lodash from 'lodash'
import styled from 'styled-components';

import Tabs from '../../shared/tabs';
import FormEmbeddedView from './embedded-view';

import localStore from '../../../store/local';
import { TabLabelContextMenu } from './body/content/context-menu';


const StyledAccordion = styled(Accordion)`
  div.accordion-item-wrapper {
    .content {
      display: none;

      &.active {
        display: block !important;
      }
    }
  }
`;

export default class Container extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    record: PropTypes.object.isRequired,
    components: PropTypes.array.isRequired,
    asTabs: PropTypes.bool.isRequired,
    handleAction: PropTypes.func.isRequired,
    parent: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = { activeComponents: [] };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  shouldComponentUpdate(nextProps) {
    if (lodash.isEmpty(nextProps.record.attributes)) return false;

    return true;
  }

  setContent = (props) => {
    const { model, record, components = [], asTabs } = props;
    const [ component = {} ] = components;

    const storeKey = `related_view/${model.alias}/${record.id}`;
    const defaultActiveComponents = asTabs ? lodash.compact([component.key]) : components.map((_, key) => key);
    const storedActiveComponent = asTabs ? (parseInt(localStore.get(`tabs/${storeKey}`)) || 0) : 0;
    const activeComponents = lodash.uniq([...defaultActiveComponents, storedActiveComponent]);

    this.setState({ activeComponents });
  }

  selectComponent = (component) => {
    this.setState({ activeComponents: [component] });
  }

  isRTL = (component) => {
    const { id: fieldId, alias, type: fieldType } = component.field;
    const { record } = this.props;

    return fieldType === 'reference_to_list' && record.getField(alias);
  }

  renderComponent = (component) => {
    const { parent, model, record, handleAction } = this.props;
    const enabled = this.isRTL(component) ? record.isFieldEnabled(component.field.alias) : true;
    const type = this.isRTL(component) ? 'rtl' : 'related_view';

    return (
      <FormEmbeddedView
        model={model}
        record={record.attributes}
        options={component}
        handleAction={handleAction}
        enabled={enabled}
        parent={parent}
        type={type}
      />
    );
  }

  buildComponentName = (component = {}) => {
    const { options = {}, model = {}, field = {}, view = {} } = component

    if (options.name) {
      return options.name;
    }

    if (field.type === 'reference_to_list') {
      return `${field.name} [${view.name}] (${model.plural || model.name}) RTL`;
    } else {
      let result = model.plural || model.name;
      if (view.name) result += ` [${view.name}]`;

      return result;
    }
  }

  isRequired = (field) => {
    return field.type === 'reference_to_list' && this.props.record.isFieldRequired(field.alias);
  }

  renderTabLabelContextMenu = (component) => (content) => {
    const { model, parent } = this.props;
    const type = 'related_components'
    const label = this.buildComponentName(component)

    return (
      <TabLabelContextMenu model={model} tabId={component.id} formId={parent.id} type={type} label={label}>
        {content}
      </TabLabelContextMenu>
    );
  }

  renderComponentsAsTabs = () => {
    const { model, record, components } = this.props;

    return (
      <Tabs storeToKey={`related_view/${model.alias}/${record.id}`} onSelect={this.selectComponent}>
        {components.map(component =>
          <Tabs.Pane
            key={`tab-${component.key}`}
            label={this.buildComponentName(component)}
            labelContextMenuRenderer={this.renderTabLabelContextMenu(component)}
            required={this.isRequired(component.field)}
          >
            {this.state.activeComponents.includes(component.key) && this.renderComponent(component)}
          </Tabs.Pane>
        )}
      </Tabs>
    );
  }

  renderPlainComponents = () => {
    const { activeComponents: active } = this.state;
    const { components } = this.props;

    const handleTitleClick = (e, index) => {
      let activeComponents = [ ...active ]
      const isComponentActive = lodash.isNumber(lodash.find(active, c => c === index.index))

      if (!isComponentActive) {
        activeComponents = active.concat(index.index)
      } else {
        activeComponents = lodash.filter(active, c => c !== index.index)
      }

      this.setState({ activeComponents })
    };
    
    
    return (
      <StyledAccordion exclusive>
        {lodash.map(components, (component) => {
          const { model, parent } = this.props;

          const type = 'related_components'
          const isActive = lodash.isNumber(lodash.find(active, a => a == component.key))
          const label = this.buildComponentName(component)

          return (
            <div key={component.key} className="accordion-item-wrapper">
              <TabLabelContextMenu model={model} tabId={component.id} formId={parent.id} type={type} label={label}>
                <Accordion.Title
                  key={`panel-${component.key}`}
                  active={isActive}
                  index={component.key}
                  onClick={handleTitleClick}
                >
                  <Icon name='dropdown' />
                  {label}
                </Accordion.Title>
              </TabLabelContextMenu>
              <Accordion.Content active={isActive}>
                {this.renderComponent(component)}
              </Accordion.Content>
            </div>
          )
        })}
      </StyledAccordion>
    )
  }

  render() {
    const { record, components = [] } = this.props;

    if (!record.metadata.inserted) return null;
    if (!components.length) return null;

    return (
      <div className="form-related-views" style={{ margin: '20px 0' }}>
        <Divider section />
        {this.props.asTabs ? this.renderComponentsAsTabs() : this.renderPlainComponents()}
      </div>
    );
  }
}
