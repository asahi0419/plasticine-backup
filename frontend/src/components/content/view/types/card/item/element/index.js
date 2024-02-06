import React from 'react';

import Text from './text';
import Action from './action';
import Thumbnail from './thumbnail';
import Field from './field';

export default (component, parentStyles, { fields, actions, model, record, handleAction, imageHeight }) => {

  return new ElementFactory({ component, parentStyles, fields, actions, model, record, handleAction, imageHeight }).getElement();
}


class ElementFactory {

  constructor(props) {
    this.props = props;
    this.action = this.findAction();
  }

  findAction() {
    const { actions, component: { params: {action: actionId}}} = this.props;
    return actionId && actions.find(({id}) => id === actionId);
  }

  findField(fieldAlias) {
    return this.props.fields.find(({alias}) => alias === fieldAlias);
  }

  getTextAlign() {
    return this.props.parentStyles.getCSSRules(['textAlign']);
  }

  wrapElement(element) {
    const { component, model, record, handleAction } = this.props;

    return (
      this.action ?
        <Action
          action={this.action}
          params={{...component.params, type: 'link'}}
          model={model}
          record={record}
          handleAction={handleAction}
        >
          {element}
        </Action> : element
    );
  }

  getElement() {
    const { component, model, record, handleAction, imageHeight } = this.props;

    if (/^__text__\./.test(component.id)) {
      return this.wrapElement(<Text params={component.params}/>);
    }

    if (/^__action__\./.test(component.id)) {
      if (!this.action) return <span>No action selected</span>;

      return (
        <Action
          action={this.action}
          params={component.params}
          model={model}
          record={record}
          handleAction={handleAction}
        />
      );
    }

    if (component.id === '__attachment_viewer__') {
      return this.wrapElement(
        <Thumbnail
          model={model}
          record={record}
          fromSelf={true}
          align={this.getTextAlign()}
          params={component.params}
          imageHeight={imageHeight}
        />
      );
    }

    if (component.id === '__thumbnail__') {
      return this.wrapElement(
        <Thumbnail
          model={model}
          record={record}
          align={this.getTextAlign()}
          params={component.params}
          imageHeight={imageHeight}
        />
      );
    }

    if (/^__thumbnail__\./.test(component.id)) {
      const fromField = this.findField(component.id.split('.')[1]);

      return this.wrapElement(
        <Thumbnail
          model={model}
          record={record}
          fromField={fromField}
          align={this.getTextAlign()}
          params={component.params}
          imageHeight={imageHeight}
        />
      );
    }

    const field = this.findField(component.id);
    if (field) {
      return this.wrapElement(<Field field={field} record={record} params={component.params}/>);
    }
  }
}
