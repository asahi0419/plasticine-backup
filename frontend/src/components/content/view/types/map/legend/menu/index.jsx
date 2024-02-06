import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react'
import { without, uniqBy, uniq } from 'lodash/array';
import { map, filter, includes } from 'lodash/collection';
import { pick } from 'lodash/object';
import styled from 'styled-components';

import SearchBar from '../../../../../../shared/search-bar';
import ControlPanel from '../../../../../../shared/control-panel';
import List from './list';

import * as CONFIGS from '../../configs';
import * as CONSTANTS from '../../../../../../../constants';
import * as HELPERS from './helpers';

const LegendMenuStyled = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    padding: 10px;

    > div {
      margin-bottom: 10px;
      border-radius: 3px;
    }
  }
`

export default class LegendMenu extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    legend: PropTypes.object.isRequired,
    configs: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onClickItem: PropTypes.func.isRequired,
  }

  handleSearch = (search) => {
    this.props.onChange('legend', { search, sectionsColl: [] });
  }

  handleCollSections = (input) => {
    this.props.onChange('legend', { sectionsColl: input ? map(this.props.data.sections, 'id') : [] });
  }

  handleSortSections = (input) => {
    this.props.onChange('legend', { sorted: input });
  }

  handleSortSection = (input) => {
    this.props.onChange('legend', { sectionsSort: includes(this.props.legend.sectionsSort, input.id) ? without(this.props.legend.sectionsSort, input.id) : this.props.legend.sectionsSort.concat(input.id) });
  }

  handleCollSection = (input) => {
    this.props.onChange('legend', { sectionsColl: includes(this.props.legend.sectionsColl, input.id) ? without(this.props.legend.sectionsColl, input.id) : this.props.legend.sectionsColl.concat(input.id) });
  }

  handleChckSections = (chck) => {
    const unchecked = {};

    if (chck) {
      unchecked.f = map(this.props.data.features, 'id');
      unchecked.s = map(this.props.data.sections, 'id');
      unchecked.g = map(this.props.data.groups, i => pick(i, 'id', 'section'))
    } else {
      unchecked.f = [];
      unchecked.s = [];
      unchecked.g = [];
    }

    this.props.onChange('legend', { unchecked });
  }

  handleChckSection = (input, chck) => {
    const { data } = this.props;
    const { unchecked } = this.props.legend;

    const fs = map(filter(data.features, (i) => i.properties.section === input.id), 'id');
    const ss = map(filter(data.sections, (i) => i.id === input.id), 'id');
    const gs = map(filter(data.groups, (i) => i.section === input.id), item => pick(item, 'id', 'section'));

    const f = chck ? unchecked.f.concat(fs) : without(unchecked.f, ...fs);
    const s = chck ? unchecked.s.concat(ss) : without(unchecked.s, ...ss);
    const g = chck ? unchecked.g.concat(gs) : filter(unchecked.g, function (item) { return item.section !== input.id;});

    this.props.onChange('legend', {
      unchecked: {
        f: f,
        s: s,
        g: g,
      },
    });
  }

  handleChckGroup = (input, chck) => {
    const { data } = this.props;
    const { unchecked } = this.props.legend;
    const g = chck ? unchecked.g.concat({'id' : input.id, 'section': input.section}) : filter(unchecked.g, function(i) { return i.id !== input.id || i.section !== input.section; });
    const sectionFeaturesData = filter(data.features, (ft) => (ft.properties.section === input.section) && (ft.properties.group === input.id));
    const sectionFeaturesUnch = filter(data.features, (ft) => (ft.properties.section === input.section) && (ft.properties.group === input.id) && map(g,'id').includes(ft.properties.group));
    const sectionUnch = uniqBy(sectionFeaturesData, 'id').length === uniqBy(sectionFeaturesUnch, 'id').length;
    const s = sectionUnch ? unchecked.s.concat(input.section) : without(unchecked.s, input.section);
    const f = chck ? uniq(unchecked.f.concat(map(sectionFeaturesUnch, 'id'))) : without(unchecked.f, ...map(sectionFeaturesData, 'id'));

    this.props.onChange('legend', {
      unchecked: {
        f: f,
        s: s,
        g: g,
      },
    });
  }

  handleChckFeature = (input, chck) => {
    const { data } = this.props;
    const { unchecked } = this.props.legend;

    const f = chck ? unchecked.f.concat(input.id) : without(unchecked.f, input.id);
    const sectionFeaturesData = filter(data.features, (ft) => (ft.properties.section === input.section));
    const sectionFeaturesUnch = filter(data.features, (ft) => (ft.properties.section === input.section) && f.includes(ft.id));
    const sectionUnch = uniqBy(sectionFeaturesData, 'id').length === uniqBy(sectionFeaturesUnch, 'id').length;
    const s = sectionUnch ? unchecked.s.concat(input.section) : without(unchecked.s, input.section);

    this.props.onChange('legend', {
      unchecked: {
        f: f,
        s: s,
        g: unchecked.g,
      },
    });
  }

  renderSearchBar() {
    return (
      <SearchBar
        style={{ height: '40px' }}
        placeholder={ i18n.t('legend_search', { defaultValue: 'Legend search ...' })}
        value={this.props.legend.search}
        onSearch={this.handleSearch}
      />
    );
  }

  renderControls() {
    const sort = this.props.legend.sorted;
    const coll = this.props.legend.sectionsColl.length === this.props.data.sections.length;
    const chck = this.props.legend.unchecked.s.length === this.props.data.sections.length;

    const chckIcon = `${chck ? '' : 'check '}square outline`;
    const collIcon = `${coll ? 'plus' : 'minus'}`;
    const sortIcon = `sort alphabet ${sort ? 'down' : 'up'}`;

    const chckTitle = chck ? i18n.t('show_all_items', { defaultValue: 'Show all items' }) : i18n.t('hide_all_items', { defaultValue: 'Hide all items' });
    const collTitle = coll ? i18n.t('expand_sections', { defaultValue: 'Expand sections' }) : i18n.t('collapse_sections', { defaultValue: 'Collapse sections' });
    const sortTitle = i18n.t('order_all_items', { defaultValue: 'Order all items' });

    const chckClick = () => this.handleChckSections(!chck);
    const collClick = () => this.handleCollSections(!coll);
    const sortClick = () => this.handleSortSections(!sort);

    return (
      <ControlPanel>
        <Icon name={chckIcon} title={chckTitle} onClick={chckClick} />
        <Icon name={collIcon} title={collTitle} onClick={collClick} />
        <Icon name={sortIcon} title={sortTitle} onClick={sortClick} />
      </ControlPanel>
    );
  }

  renderList() {
    const { unchecked, sectionsColl, sectionsSort, sorted, search } = this.props.legend;
    const { data } = this.props;

    const sections = HELPERS.getVisibleSections(data, search);

    return (
      <List
        sections={sections}
        unchecked={unchecked}
        sectionsColl={sectionsColl}
        sectionsSort={sectionsSort}
        sorted={sorted}
        onSortSection={this.handleSortSection}
        onCollSection={this.handleCollSection}
        onChckSection={this.handleChckSection}
        onChckGroup={this.handleChckGroup}
        onChckFeature={this.handleChckFeature}
        onClickItem={this.props.onClickItem}
      />
    );
  }

  render() {
    const style = {};

    if (this.props.configs.legendShow) {
      style.minWidth = CONFIGS.DEFAULT_LEGEND_MIN_WIDTH;
      style.maxWidth = this.props.configs.legendMaxWidth || CONFIGS.DEFAULT_LEGEND_MAX_WIDTH;
      style.width = this.props.configs.legendWidth || CONFIGS.DEFAULT_CONFIGS.legendWidth;
    } else {
      style.width = 0;
      style.opacity = 0;
    }

    return (
      <LegendMenuStyled vertical id="view-map-legend-menu" className="legend" style={style}>
        {this.renderSearchBar()}
        {this.renderControls()}
        {this.renderList()}
      </LegendMenuStyled>
    );
  }
}
