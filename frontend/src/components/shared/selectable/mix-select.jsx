import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'semantic-ui-react';
import { forEach, every, filter, map } from 'lodash/collection';
import { flatten } from 'lodash/array';
import { isEqual } from 'lodash/lang';

import { makeUniqueID } from '../../../helpers';
import ScrollableList from './scrollable-list';

export default class MixSelect extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    formatter: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    height: PropTypes.number,
    angleRightTitle: PropTypes.string,
    angleLeftTitle: PropTypes.string,
  }

  static Basket = ScrollableList;

  constructor(props) {
    super(props);
    this.state = { activeItemsOnBaskets: {}, activeItemsOnTarget: [] };
  }

  // Input: green - [1, 2] and red - [3, 4]
  // Output: [{ green: 1, red: 3 }, { green: 1, red: 4 }, { green: 2, red: 3 }, { green: 2, red: 4 }]
  handleCreateMix = () => {
    if (Object.keys(this.state.activeItemsOnBaskets).length !== this.props.children.length) return;

    const { items, onChange } = this.props;
    if (!onChange) return;

    // Believe that it can be done easier :)
    let newItems = [];
    forEach(this.state.activeItemsOnBaskets, (values, backet) => {
      const objects = values.map(value => ({ [backet]: value }));
      newItems = newItems.length ?
        flatten(objects.map(object => newItems.map(item => Object.assign({ id: makeUniqueID() }, object, item)))) :
        objects;
    });

    this.setState({ activeItemsOnBaskets: {}}, () => onChange(items.concat(newItems)));
  }

  handleRemoveMix = () => {
    const { activeItemsOnTarget } = this.state;
    const { items, onChange } = this.props;

    const disabledItems = filter(activeItemsOnTarget, 'disabled');
    if (disabledItems.length) {
      const disabledHeader = i18n.t('no_permissions_to_delete_items', { defaultValue: 'You have no permission to delete items' });
      const disabledItemsList = map(disabledItems, 'text').join('\n');
      return alert(`${disabledHeader}\n\n${disabledItemsList}`);
    }

    const idsToRemove = activeItemsOnTarget.map(({ id }) => id);

    this.setState({ activeItemsOnTarget: [] }, () =>
      onChange(items.filter(item => !idsToRemove.includes(item.id)))
    );
  }

  renderControls() {
    const { angleRightTitle, angleLeftTitle } = this.props;

    return (
      <div>
        <Icon name="angle right" size="big" link title={angleRightTitle} fitted onClick={this.handleCreateMix} />
        <br />
        <Icon name="angle left" size="big" link title={angleLeftTitle} fitted onClick={this.handleRemoveMix} />
      </div>
    );
  }

  handleChooseItemOnBasket = (basket, items) => {
    const { activeItemsOnBaskets } = this.state;
    activeItemsOnBaskets[basket] = items;
    this.setState({ activeItemsOnBaskets });
  }

  handleChooseItemOnTarget = (items) => this.setState({ activeItemsOnTarget: items });

  render() {
    const { title, items, children, formatter, height } = this.props;

    return (
      <Grid columns="equal">
        <Grid.Row>
          <Grid.Column>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                const basket = child.props.name;
                return React.cloneElement(child, {
                  activeItems: this.state.activeItemsOnBaskets[basket],
                  onChoose: this.handleChooseItemOnBasket.bind(this, basket),
                });
              } else {
                return child;
              }
            })}
          </Grid.Column>

          <Grid.Column width={1} textAlign="center" verticalAlign="middle">
            {this.renderControls()}
          </Grid.Column>

          <Grid.Column>
            <ScrollableList
              title={title}
              items={items.map(formatter)}
              activeItems={this.state.activeItemsOnTarget}
              onChoose={this.handleChooseItemOnTarget}
              height={height}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
