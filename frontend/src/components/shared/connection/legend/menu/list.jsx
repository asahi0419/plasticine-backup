import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import { isNull } from 'lodash/lang';
import { map, reduce, orderBy, some } from 'lodash/collection';
import styled from 'styled-components';

import * as CONSTANTS from '../../../../../constants';
import * as HELPERS from './helpers';
import { handleSort } from './helpers';
import * as CONFIGS from '../../configs';
import { before, indexOf } from 'lodash';

const LegendMenuListStyled = styled.div`
  width: 100%;
  height: calc(100% - 70px);
  overflow-y: auto;

  .icon {
    cursor: pointer;
  }

  .legend-list-wrapper {
    padding: 1px 10px 1px 10px;
    border-bottom: none !important; 
  }

  .legend-list {
    position: relative;
    display: flex;
    
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
      .legend-list-name-search {
        background-color: #c3b6b6 !important; 
      }
    }

    &.group {
      .legend-list-name,
      .legend-list-size {
        opacity: 0.7;
      }
      .legend-list-name-search {
        background-color: #c3b6b6 !important; 
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    height: calc(100% - 83px);
  }
`;

export default class LegendMenuList extends Component {
  static propTypes = {
    sections: PropTypes.object.isRequired,
    sections_all: PropTypes.object.isRequired,
    sections_origin: PropTypes.object.isRequired,
    legend: PropTypes.object.isRequired,
    sorted: PropTypes.bool,
    unchecked: PropTypes.object.isRequired,
    sectionsColl: PropTypes.array.isRequired,
    sectionsSort: PropTypes.array.isRequired,
    // onChckSection: PropTypes.func.isRequired,
    onCollSection: PropTypes.func.isRequired,
    // onChckGroup: PropTypes.func.isRequired,
    onChckFeature: PropTypes.func.isRequired,
    onClickItem: PropTypes.func.isRequired,
    onTickChange: PropTypes.func.isRequired,

  }
  
  constructor(props) {
    super(props);

    this.state = { 
      limits: {},
      size: 0, 
  };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setContent(nextProps);
  }

  setContent = (props) => {
    const limits = reduce(props.graph, (result, { id }) => ({ ...result, [id]: CONFIGS.LIST_ITEMS_LIMIT }), {});

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

    // const key = HELPERS.makeUniqueID();
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

    return (
      <div key={i}>
        <div className="legend-list group" style={{ backgroundColor: group['bg-color'] }}>
          <div>
            <Icon
              name={`${chck ? 'check ' : ''}square outline`}
              title={chck
                ? i18n.t(`hide_items`, { defaultValue: `Hide items` })
                : i18n.t(`show_items`, { defaultValue: `Show items` }) }
            />
            <Icon
              name={group.icon}
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
    const name = feature.name; 
    const backgroundColor = feature['bg-color'];
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
            <span
              title={name}
              style={{ cursor: 'pointer' }}
              className="legend-list-name"
              // onClick={() => this.props.onClickItem(feature)}
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
            {map(this.props.sections.graph, (feature = {}, i) => this.renderFeature(feature, i))}
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
            // onClick={() => this.props.onChckSection(section, chck)}
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
            onClick={() => this.props.onCollSection(coll)}
          />
        </div>
      </div>
    );
  }

  renderSection = (section = {}, i) => {
    var temp_child = []; 
    var coll1 = section.minimize ? false : true; 
    const { search } = this.props.legend; 


    // When drop down is active, not display
    if (section.display == 'none') 
      return; 
    var chck, last, fir, search_dis; 
    if (section.collapsed !== false && section.collapsed !== true) 
      section.collapsed = false; 

    // when mid element checks, its root element changes simultaneously
    for (var q = 0; q < this.props.sections.graph.length; q++) {
      if (section.type == 'mid' && this.props.sections.graph[q].id == section.parent){
        if (this.props.sections.graph[q].collapsed == true){
          section.collapsed = true; 
        }
      }
    }

    // collapsed situation
    chck = section.collapsed; 

    const coll_state = this.props.sectionsColl.length;
    const sort = !this.props.sectionsSort.includes(section.id); 
    

    if (section.display) !this.props.sectionsSort.includes(section.id);
    const iconCheck = `${!chck ? 'check ' : ''}square outline`;
    const iconCheckTitle = chck
      ? i18n.t(`hide_item`, { defaultValue: `Hide item` })
      : i18n.t(`show_item`, { defaultValue: `Show item` });
    
    let links = this.props.sections.links; 
    
    var style = {}; 
    const tick_style = {}, right_style = {display: 'none'}; 
    let end_style, first_index, last_index, mid_type; 

    
    // display list name in legend list
    var real_name = section.name; 
    if (section.type == 'root') {
      end_style = {borderTop: '1px solid #d9d9d9', display: 'flex', justifyContent: 'space-between'};  
      style.paddingLeft = CONFIGS.root_padding; 
      style.color = 'blue';
      tick_style.color = 'rgba(0,0,0,.87)'; 
      right_style.display = 'block'; 
    }

    else if (section.type == 'mid') {
      style.paddingLeft = CONFIGS.mid_padding; 
      if (coll_state !== 0)
      {
        style.display = CONFIGS.invisible; 
      }
      const temp = this.props.sections_all.graph; 
      const indexes = []; 
      for (var j = 0; j < temp.length; j++) {
        if (temp[j].parent == section.id){
          indexes.push(temp[j].id); 
        }
      }
      first_index = indexes[0]; 
      last_index = indexes.pop(); 
      
      real_name = section.name + " : " + first_index + " - " + last_index; 
       
    }
    if (section.type == 'end'){
      style.paddingLeft = CONFIGS.end_padding; 
      return; 
    }
    
    if (search.length !== 0) {
      var temp_search = search.toLowerCase(); 
      var temp_name = real_name.toLowerCase(); 
      if (temp_name.indexOf(temp_search) >= 0) {
        var te = temp_name.indexOf(temp_search); 
        search_dis = real_name.slice(te, te + temp_search.length); 
        fir = real_name.slice(0, te); 
        last = real_name.slice(te + temp_search.length, real_name.length);
      }
      else {
        fir = real_name; 
        last = '';
      }
    }
    else {
      fir = real_name; 
      last = '';
    }
    const collClick = () => {
      const links = this.props.sections.links; 
      var tem_data = this.props.sections_origin.graph; 
      var tem_mid = []; 
      tem_data.map(each => {
        each.parent == section.id ? tem_mid.push(each) : '' 
      }); 
      tem_mid.map(ea => {
        ea.display !== 'none' || ea.display === undefined ? ea.display = 'none' : ea.display = 'block'; 
      });
      tem_mid.map(each => {
        tem_data.map(eac => {
          eac.parent == each.id ? (eac.display !== 'none' || eac.display == undefined ? eac.display = 'none' : eac.display = 'block') : ''
        })
      });
      tem_data.map(ea => {
        ea.id == section.id ? (ea.minimize !== true || ea.minimize == undefined ? ea.minimize = true : ea.minimize = false) : ''
      })
      this.props.onTickChange('legend', { sectionsColl: false ? map(te, 'id') : [] });
      this.props.onCollSection(tem_data, links);
    }; 


    return (
    <div key = { i } className = "legend-list-wrapper" style = { end_style }>
      <div className="legend-list group" style = { style }>
        <Icon
          name={iconCheck}      // check list item
          title={iconCheckTitle}
          onClick={() => this.props.onChckFeature(section, chck, links)}
          style = { tick_style }
        />
        
        <span
          title={ real_name }
          style={{ cursor: 'pointer' }}
          className="legend-list-name"
          onClick={() => this.props.onClickItem(feature)}
          onMouseOver={this.handleListNameMouseOver}
        >{fir}<span className='legend-list-name-search'>{search_dis}</span>{last}
        </span>
      </div>
      <div style={right_style}>
        <Icon   //  sort list alphabetically
          name={`sort alphabet ${sort ? 'down' : 'up'}`}
          title={i18n.t('order_items', { defaultValue: 'Order items' })}
          onClick={() => this.props.onSortSection(section, sort)}
        />
        <Icon // dropdown list element. 
          name={`caret ${coll1 ? 'down' : 'left'}`}
          title={coll1 ? i18n.t('collapse_section', { defaultValue: 'Collapse section' }) : i18n.t('expand_section', { defaultValue: 'Expand section' })}
          onClick={collClick}
        />
      </div>
    </div>
    ); 
  }
  
  render() {
    
    const sort = this.props.sectionsSort;     
    var sections = this.props.sections.graph; 
    var tem_mid = [], count = 0, new_section = [], exam = [], not_sort = []; 
    
    new_section = handleSort(sections, sort); // sort AaZz alphabetically
    
    return (
      <LegendMenuListStyled className="legend-list">
        {map(new_section, this.renderSection)}
      </LegendMenuListStyled>
    );
  }
}
