import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { isNull } from 'lodash/lang';
import { map, reduce, orderBy, some } from 'lodash/collection';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../../../../constants';
import * as HELPERS from '../../../../../../../helpers';
import * as CONFIGS from '../../configs';

const LegendMenuListStyled = styled.div`
  width: 100%;
  height: calc(100% - 70px);
  overflow-y: auto;

  .icon {
    cursor: pointer;
  }

  .legend-list-wrapper {
    padding: 10px;
  }

  .legend-list {
    position: relative;
    display: flex;
    justify-content: space-between;
    line-height: 20px;
    word-break: break-word;

    > div {
      white-space: nowrap;
      &:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &.section {
      margin: 0;

      .legend-list-name,
      .legend-list-size {
        font-weight: bold;
      }
    }

    &.group {
      .legend-list-name,
      .legend-list-size {
        opacity: 0.7;
      }
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    height: calc(100% - 83px);
  }
`;

export default class LegendMenuList extends Component {
  static propTypes = {
    sections: PropTypes.array.isRequired,
    sorted: PropTypes.bool,
    unchecked: PropTypes.object.isRequired,
    sectionsColl: PropTypes.array.isRequired,
    sectionsSort: PropTypes.array.isRequired,
    onChckSection: PropTypes.func.isRequired,
    onCollSection: PropTypes.func.isRequired,
    onChckGroup: PropTypes.func.isRequired,
    onChckFeature: PropTypes.func.isRequired,
    onClickItem: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { limits: {} };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  setContent = (props) => {
    const limits = reduce(props.sections, (result, { id }) => ({ ...result, [id]: CONFIGS.LIST_ITEMS_LIMIT }), {});

    this.setState({ limits });
  }

  handleListNameMouseOver = (e) => {
    const container = e.target.parentNode;
    const title = e.target.title || e.target.textContent;
    const overflowed = container.scrollWidth > container.clientWidth;

    e.target.title = overflowed ? title : '';
  }

  renderOtherItem = (section = {}) => {
    const { limits } = this.state;
    const limit = limits[section.id];

    if (limit >= section.features.length) return;

    const key = HELPERS.makeUniqueID();
    const style = { backgroundColor: 'rgba(0, 0, 0, 0.1)', cursor: 'pointer' };
    const onClick = () => this.setState({ limits: { ...limits, [section.id]: limit + CONFIGS.LIST_ITEMS_LIMIT } });

    return (
      <div key={key} style={style} onClick={onClick}>
        <div className="legend-list group">
          <div>
            <Icon
              name={`angle down`}
            />
            <Icon
              name={`square outline`}
              style={{ opacity: 0, cursor: 'initial' }}
            />
            <span className="legend-list-name">{i18n.t('other_items', { defaultValue: 'Other items' })}</span>
          </div>
          <div>
            <span className="legend-list-size">[{section.features.length - limit}]</span>
            <Icon
              name={`caret left`}
              style={{ opacity: 0, cursor: 'initial' }}
            />
          </div>
        </div>
      </div>
    );
  }

  renderGroup = (group = {}, i) => {
    const chck = !some(this.props.unchecked.g, function(item) {
      return item.id === group.id && item.section === group.section;
    })
    const url = HELPERS.getIcon('font-awesome', 'svg', group.icon);
    const icon = url ? group.icon : 'circle';

    return (
      <div key={i}>
        <div className="legend-list group" style={{ backgroundColor: group['bg-color'] }}>
          <div>
            <Icon
              name={`${chck ? 'check ' : ''}square outline`}
              title={chck
                ? i18n.t(`hide_items`, { defaultValue: `Hide items` })
                : i18n.t(`show_items`, { defaultValue: `Show items` }) }
              onClick={() => this.props.onChckGroup(group, chck)}
            />
            <Icon
              name={icon}
              style={{ color: group['icon-color'], cursor: 'pointer' }}
              onClick={() => this.props.onClickItem(group)}
            />
            <span
              className="legend-list-name"
              title={group.name}
              style={{ color: group['color'], cursor: 'pointer' }}
              onClick={() => this.props.onClickItem(group)}
              onMouseOver={this.handleListNameMouseOver}
            >{group.name}</span>
          </div>
          <div>
            {typeof group.size === 'number' && (
              <span
                className="legend-list-size"
                title={i18n.t('total_items_amount', { defaultValue: 'Total items amount' })}
              >[{group.size}]</span>
            )}
            <Icon
              name={`caret left`}
              style={{ opacity: 0, cursor: 'initial' }}
            />
          </div>
        </div>
      </div>
    );
  }

  renderFeature = (feature = {}, i) => {
    const chck = !this.props.unchecked.f.includes(feature.id);
    const name = feature.properties['name'] || feature.properties['p-name'] || feature.properties['pn'];
    const color = feature.properties[CONFIGS.COLOR_TYPES[feature.geometry.type]] || '#0000ff';
    const backgroundColor = feature['bg-color'];
    const icon = CONFIGS.ICON_TYPES[feature.geometry.type];
    const iconCheck = `${chck ? 'check ' : ''}square outline`;
    const iconCheckTitle = chck
      ? i18n.t(`hide_item`, { defaultValue: `Hide item` })
      : i18n.t(`show_item`, { defaultValue: `Show item` });

    return (
      <div key={i}>
        <div className="legend-list group" style={{ backgroundColor }}>
          <div>
            <Icon
              name={iconCheck}
              title={iconCheckTitle}
              onClick={() => this.props.onChckFeature(feature, chck)}
            />
            <Icon
              name={icon}
              style={{ color, cursor: 'pointer' }}
              onClick={() => this.props.onClickItem(feature)}
            />
            <span
              title={name}
              style={{ cursor: 'pointer' }}
              className="legend-list-name"
              onClick={() => this.props.onClickItem(feature)}
              onMouseOver={this.handleListNameMouseOver}
            >{name}</span>
          </div>
        </div>
      </div>
    );
  }

  renderSectionContent = (section = {}, chck, coll, sort) => {
    const style = { paddingLeft: '7px' };

    if (coll) {
      const order = sort ? 'asc' : 'desc';

      if (section.groups) {
        const groups = orderBy(
          section.groups,
          [(g = {}) => (g['name'] || g['p-name'] || g['pn']).toLowerCase()],
          [order]
        );

        return (
          <div style={style}>
            {map(groups, (group = {}, i) => this.renderGroup(group, i))}
          </div>
        );
      }

      if (section.features) {
        const features = orderBy(
          section.features.slice(0, this.state.limits[section.id]),
          [(f = {}) => (f.properties['name'] || f.properties['p-name'] || f.properties['pn']).toLowerCase()],
          [order]
        );

        return (
          <div style={style}>
            {map(features, (feature = {}, i) => this.renderFeature(feature, i))}
            {this.renderOtherItem(section)}
          </div>
        );
      }
    }
  }

  renderSectionHeader = (section = {}, chck, coll, sort) => {
    let size;

    if (section.features) size = section.features.length;
    if (section.groups) size = lodash.reduce(section.groups, (r, g) => r + g.size, 0);

    return (
      <div className="legend-list section" style={{ backgroundColor: section['bg-color'] }}>
        <div className="legend-list-container">
          <Icon
            name={`${chck ? 'check ' : ''}square outline`}
            title={chck ? i18n.t('hide_items', { defaultValue: 'Hide items' }) : i18n.t('show_items', { defaultValue: 'Show items' })}
            onClick={() => this.props.onChckSection(section, chck)}
          />
          <span
            className="legend-list-name"
            style={{ color: section.color, cursor: 'pointer' }}
            title={section.name}
            onMouseOver={this.handleListNameMouseOver}
            onClick={() => this.props.onClickItem(section)}
          >
            {section.icon && <Icon name={section.icon} style={{ color: section['icon-color'] }} />}
            <span style={{ color: section['color'] }}>{section.name}</span>
          </span>
        </div>
        <div>
          <Icon
            name={`sort alphabet ${sort ? 'down' : 'up'}`}
            title={i18n.t('order_items', { defaultValue: 'Order items' })}
            onClick={() => this.props.onSortSection(section, sort)}
          />
          <span
            title={i18n.t('total_items_amount', { defaultValue: 'Total items amount' })}
            className="legend-list-size"
          >[{size}]</span>
          <Icon
            name={`caret ${coll ? 'down' : 'left'}`}
            title={coll ? i18n.t('collapse_section', { defaultValue: 'Collapse section' }) : i18n.t('expand_section', { defaultValue: 'Expand section' })}
            onClick={() => this.props.onCollSection(section, coll)}
          />
        </div>
      </div>
    );
  }

  renderSection = (section = {}, i) => {
    const chck = !this.props.unchecked.s.includes(section.id);
    const coll = !this.props.sectionsColl.includes(section.id);
    const sort = !this.props.sectionsSort.includes(section.id);

    return (
      <div key={i} className="legend-list-wrapper">
        {this.renderSectionHeader(section, chck, coll, sort)}
        {this.renderSectionContent(section, chck, coll, sort)}
      </div>
    );
  }

  render() {
    const sections = isNull(this.props.sorted)
      ? this.props.sections
      : orderBy(this.props.sections, [(i) => (i['name'] || '').toLowerCase()], [this.props.sorted ? 'asc' : 'desc']);

    return (
      <LegendMenuListStyled className="legend-list">
        {map(sections, this.renderSection)}
      </LegendMenuListStyled>
    );
  }
}
