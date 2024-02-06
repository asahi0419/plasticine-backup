import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, Button, Divider } from 'semantic-ui-react';
import { map } from 'lodash/collection';

import * as HELPERS from '../../../../helpers';
import Item from './item';

const FilterContentStyled = styled.div`
.filter-group-divider {
  width: calc(100% - 35px) !important;
  margin-left: 35px;
}
`;

export default class extends Component {
  static propTypes = {
    content: PropTypes.array.isRequired,
    model: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    compact: PropTypes.bool.isRequired,
    updater: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    loadTemplateFields: PropTypes.func.isRequired,
    loadReferenceFields: PropTypes.func.isRequired,
    isCondition: PropTypes.bool,
  }

  itemProps = (item) => {
    const { model, compact, fields: availableFields, templates,
      updater, loadTemplateFields, loadReferenceFields, isCondition } = this.props;
    const { id, field, operator, value, rawValue } = item;
    const itemValue = HELPERS.isJSString(rawValue) ? rawValue : value;

    return {
      id,
      model,
      field,
      operator,
      value: itemValue,
      availableFields,
      compact,
      onAdd: (type, id) => updater('ADD_ITEM', { type, id }),
      onChange: (item, id) => updater('CHANGE_ITEM', { item, id }),
      onDestroy: (id) => updater('DESTROY_ITEM', { id }),
      templates,
      loadTemplateFields,
      loadReferenceFields,
      isCondition,
    };
  }

  renderDivider(key) {
    if (this.props.content.length === (key + 1)) return;

    return (
      <Divider
        className="filter-group-divider"
        horizontal>{i18n.t('or', { defaultValue: 'Or' })}
      </Divider>
    );
  }

  renderGroupItems(items) {
    return (
      <div className="filter-group-items">
        {map(items, (item, key) => (
          <Item
            {...this.itemProps(item)}
            key={key}
            index={key}
            type={item.itemOperator}
          />
        ))}
      </div>
    );
  }

  render() {
    const { content: groups } = this.props;

    return (
      <FilterContentStyled className="filter-content">
        {map(groups, (group, key) => (
          <div key={key} className="filter-group">
            {this.renderGroupItems(group.items)}
            {this.renderDivider(key)}
          </div>
        ))}
      </FilterContentStyled>
    );
  }
}
