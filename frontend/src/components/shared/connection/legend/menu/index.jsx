import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react'
import { without, uniqBy, uniq } from 'lodash/array';
import { map, filter, includes } from 'lodash/collection';
import { pick } from 'lodash/object';
import styled from 'styled-components';

import SearchBar from '../../../search-bar';
import ControlPanel from '../../../control-panel';
import List from './list';

import * as CONFIGS from '../../configs';
import * as CONSTANTS from '../../../../../constants';
import * as HELPERS from './helpers';
import { removed } from 'dompurify';
import { each } from 'store';

const LegendMenuStyled = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  resize: horizontal; 
  overflow: auto; 
  max-width: 350px !important; 
  min-width: 150px !important; 

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    padding: 10px;

    > div {
      border-top, border-left, border-right: 1px solid #d9d9d9; 
    }
  }
`

export default class LegendMenu extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    legend: PropTypes.object.isRequired,
    configs: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onTickChange: PropTypes.func.isRequired,
    onClickItem: PropTypes.func.isRequired,
    win_size: PropTypes.number.isRequired,
    sorted_result: PropTypes.bool.isRequired,
    sorted: PropTypes.func.isRequired,
  }

  handleSearch = (search) => {
    this.props.onTickChange('legend', { search, sectionsColl: [] });
  }
  //33333
  handleSortSections = (input) => {
    // this.props.onTickChange('legend', { sorted: input });
    this.props.sorted(input); 
  }

  handleSortSection = (input) => {
    this.props.onTickChange('legend', { sectionsSort: includes(this.props.legend.sectionsSort, input.id) ? without(this.props.legend.sectionsSort, input.id) : this.props.legend.sectionsSort.concat(input.id) });
  }

  handleCollSection = (input, links) => {
    const { onChange } = this.props; 
    
    const newArr1 = {graph: input, links:links}; 
    const temp2 = JSON.stringify(newArr1);
    if (onChange){
      onChange(null, { value: temp2 });
    } 
  }

  handleChckSections = (chck) => {    // first true
    const { data, onChange } = this.props;
    let links = data.links; 
    let temp = data.graph; 
    for (var i = 0; i < temp.length; i++) {
      if (!chck){
        temp[i].collapsed = true; 
      }
      else temp[i].collapsed = false; 
    }
    const unchecked = {};
    if (!chck) {
      unchecked.f = map(this.props.data.graph, 'id');
    } 
    else {
      unchecked.f = [];
      unchecked.s = [];
      unchecked.g = [];
    }
    this.props.onTickChange('legend', { unchecked });
    const newArr1 = {graph: temp, links:links}; 
    const temp2 = JSON.stringify(newArr1);
    if (onChange){
      onChange(null, { value: temp2 });
    } 
  }
  //true down
  handleCollSections = (input) => {
    const { data, onChange } = this.props;
    let links = data.links;
    const te = this.props.data.graph; 
    input == true ? (te.map(each => {
      each.type !== 'root' ? each.display = 'none' : ''
    })) : (te.map(each => {
      each.type !== 'root' ? each.display = 'block' : ''
    })); 
    
    input == true ? te.map(each => {
      each.type == 'root' ? each.minimize = true : ''
    }) : te.map(each => {
      each.type == 'root' ? each.minimize = false : ''
    }); 
    
    this.props.onTickChange('legend', { sectionsColl: input ? map(te, 'id') : [] });
    const newArr1 = {graph: te, links:links}; 
    const temp2 = JSON.stringify(newArr1);
    if (onChange){
      onChange(null, { value: temp2 });
    } 
  }

 

  handleChckFeature = (input, chck, links) => {
    const { data, onChange } = this.props;
    const { unchecked } = this.props.legend;
    let temp = data.graph; 
    var chch_arr = [], chch_mid_arr = []; 
    if (input.type == 'mid' && chck == false){
      for (var re = 0; re < temp.length; re++) {
        if (temp[re].id == input.parent)
          chch_arr.push(temp[re].id); // mid-root
      }
      
    }
    chch_arr.push(input.id); 

    for (var i = 0; i < temp.length; i++) {
      if (temp[i].parent == input.id) { //in case of mid-end
        if (input.type == 'root'){
          chch_mid_arr.push(temp[i].id);  //in case of root-mid
        }
      }
    }
    for(let i = 0; i < unchecked.f.length; i++) {
      for(let j = 0; j < chch_arr.length; j++) {
        if(unchecked.f[i] == chch_arr[j]) {
          unchecked.f.splice(i, 1); 
        }
      }
    }
    const f = chck ? unchecked.f = unchecked.f.concat(chch_arr) : unchecked.f;
    this.props.onTickChange('legend', {
      unchecked: {
        f: f,
        s: [],
        g: unchecked.g,
      },
    });
    // when checked the element in legend list, corresponding picture removed or restored. 
    // set element collapsed

    if (input.collapsed == true)
      input.collapsed = false; 
    else { input.collapsed = true; }

    if (input.type == 'mid' && chck == true){
      for (var re = 0; re < temp.length; re++) {
        if (temp[re].id == input.parent){
            temp[re].collapsed = false; 
        }
      }
      temp.map(tem => {
        tem.parent == input.id ? tem.collapsed = false : ''; 
      });
    }
    
    if (input.type == 'root'){
      let temp_mid; 
      for (var j = 0; j < temp.length; j++){
        if (temp[j].parent == input.id && temp[j].id !== input.id){ // mid
          if (input.collapsed == true) {
            temp[j].collapsed = true; 
          }
          else temp[j].collapsed = false; 
        }
      }
    }

   
    const newArr1 = {graph: temp, links:links}; 
    const temp1 = JSON.stringify(newArr1);
    if (onChange){
      onChange(null, { value: temp1 });
    } 
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
    const { data } = this.props;
    if (this.props == null || this.props.length == 0) return; 
    const sort = this.props.sorted_result;

    var chck = true; 
    for (var i = 0; i < data.graph.length; i++) {
      if (data.graph[i].collapsed == false || data.graph[i].collapsed == undefined)
        chck = false; 
    }
    const tem_data = this.props.data.graph; 
    var coll = this.props.legend.sectionsColl.length === this.props.data.graph.length;
    var num_none = 0, num_block = 0; 

    tem_data.map(each => {
      each.type == 'root' || (each.type !== 'root' && each.display == 'none') ? num_none++ : ''; 
      each.type == 'root' || (each.type !== 'root' && each.display == 'block') ? num_block++ : ''; 
    }); 
    num_none == tem_data.length ? coll = true : ''; 
    num_block == tem_data.length ? coll = false : ''; 
    // this.props.legend.sectionsColl ? () : (); 
    
    const chckIcon = `${chck ? '' : 'check '}square outline`; // when false, tick; 
    const collIcon = `${coll ? 'plus' : 'minus'}`;
    const sortIcon = `sort alphabet ${sort ? 'up' : 'down'}`;

    const chckTitle = chck ? i18n.t('show_all_items', { defaultValue: 'Show all items' }) : i18n.t('hide_all_items', { defaultValue: 'Hide all items' });
    const collTitle = coll ? i18n.t('expand_sections', { defaultValue: 'Expand sections' }) : i18n.t('collapse_sections', { defaultValue: 'Collapse sections' });
    const sortTitle = i18n.t('order_all_items', { defaultValue: 'Order all items' });
    const chckClick = () => this.handleChckSections(chck);


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
    const sorted_result = this.props.sorted_result; 
    var temp_name;
    var new_arr = [], tem_arr = [], graph_data_origin = []; 
    var graph_data = data.graph;
    var tem_root = [], tem_r = [], sort_tem_root = [], order = 0, order1 = 0, tem_sort_name_asc = [], tem_sort_name_dsc = [];   
    var r_root_asc = [], r_root_dsc = []; 
    graph_data.map(each => {
      each.type == 'root' ? (sort_tem_root.push(each), tem_sort_name_asc.push(each.name), tem_sort_name_dsc.push(each.name)) : ''; 
    }); 
    tem_sort_name_asc.sort()
    tem_sort_name_dsc.sort().reverse(); 
    tem_sort_name_asc.map(each => {
      sort_tem_root.map(ea => {
        ea.name == each ? r_root_asc.push(ea) : ''
      }); 
    }); 
    tem_sort_name_dsc.map(each => {
      sort_tem_root.map(ea => {
        ea.name == each ? r_root_dsc.push(ea) : ''
      }); 
    }); 
    
    // when pressed sort all button, it returns result(sorted == true dsc)
    if (sorted_result == true) {
      graph_data.map((eac, index1) => {
        eac.type == 'root' ? (graph_data[index1] = r_root_dsc[order], order++) : ''
      });
      
      graph_data.map(each_root => {
        each_root.type == 'root' && tem_root.includes(each_root) == false ? (
          tem_root.push(each_root),
          graph_data.map(each_mid => {
            each_mid.parent == each_root.id && tem_root.includes(each_mid) == false ? (
              tem_root.push(each_mid), 
              graph_data.map(each_end => {
                each_end.parent == each_mid.id && tem_root.includes(each_end) == false ? (
                  tem_root.push(each_end)
                ) : ''
              })
            ) : ''
          })
       ) : ''; 
      });
      //modified(when pressed sort all button, it returns original data)
      graph_data.map((eac, index1) => {
        eac.type == 'root' ? (graph_data[index1] = r_root_asc[order1], order1++) : ''
      });

      graph_data.map(each_root => {
        each_root.type == 'root' && graph_data_origin.includes(each_root) == false ? (
        graph_data_origin.push(each_root),
        graph_data.map(each_mid => {
          each_mid.parent == each_root.id && graph_data_origin.includes(each_mid) == false ? (
            graph_data_origin.push(each_mid), 
            graph_data.map(each_end => {
              each_end.parent == each_mid.id && graph_data_origin.includes(each_end) == false ? (
                graph_data_origin.push(each_end)
              ) : ''
            })
            ) : ''
          })
       ) : ''; 
      }); 
    }
    
    else {
      graph_data.map((eac, index1) => {
        eac.type == 'root' ? (graph_data[index1] = r_root_asc[order], order++) : ''
      });

      graph_data.map(each_root => {
        each_root.type == 'root' && tem_root.includes(each_root) == false ? (
        tem_root.push(each_root),
        graph_data.map(each_mid => {
          each_mid.parent == each_root.id && tem_root.includes(each_mid) == false ? (
            tem_root.push(each_mid), 
            graph_data.map(each_end => {
              each_end.parent == each_mid.id && tem_root.includes(each_end) == false ? (
                tem_root.push(each_end)
              ) : ''
            })
            ) : ''
          })
       ) : ''; 
      }); 
      graph_data_origin = data.graph;
    }
    const links_data = data.links; 
    var temp_parent = [], parent_flag = 0, root_flag = 0, temp_mid = [], end_parent_flag = 0, temp_mid_mid = []; 
    var root_flag = 0; 
    var te1 = [];
    var show_end = [], tem_len, search_flag = 0; //search_flag is evaluation if end element is first or last element. 
    const search_key = search.toLowerCase(); 
    
    
    // legend search part
    for (var i = 0; i < tem_root.length; i++) {
      temp_name = tem_root[i].name.toLowerCase();
      if ( tem_root[i].type == 'root' ){
        if (temp_name.indexOf(search_key) >= 0){
          new_arr.push(tem_root[i]); 
          root_flag = 1; 
        }        
        else temp_parent = tem_root[i]; 
        parent_flag = 0; 

        if (root_flag == 1) {
          for (var k = i; k < tem_root.length; k++) {
            if (tem_root[k].parent == tem_root[i].id) {
              temp_mid = tem_root[k];
              new_arr.push(temp_mid); 
              tem_root.map((dt) => (
               dt.parent == temp_mid.id ? new_arr.push(dt) : '' 
              ))
            }
          }
          root_flag = 0; 
        }
      }
      else if (tem_root[i].type == 'mid') {
        if (temp_name.indexOf(search_key) >= 0) {
          for (var j = 0; j < new_arr.length; j++) {
            if (new_arr[j].id == tem_root[i].parent) 
              parent_flag = 1;  
          }
          if (parent_flag == 0) {
            new_arr.push(temp_parent); 
          }
          new_arr.push(tem_root[i]); 
          for (var k = i; k < tem_root.length; k++) {
            if (tem_root[k].parent == tem_root[i].id) {
              new_arr.push(tem_root[k]); 
            }
          }
        }
      } 


      else if (tem_root[i].type == 'end') {
        var t1 = tem_root[i].id; 
        tem_root.forEach(ele => {
          if (ele.id == tem_root[i].parent) 
            temp_mid_mid = ele;
        })

        tem_root.forEach(ele => {
          if (ele.parent == temp_mid_mid.id) {
            show_end.push(ele); 
          }
        })
        tem_len = show_end.length - 1; 
        if (tem_root[i] == show_end[0] || tem_root[i] == show_end[tem_len]){
          search_flag = 1; 
        }
        else search_flag = 0; 

        if (t1.indexOf(search_key) >= 0) {
          new_arr.forEach(e => {
            if (e.id == tem_root[i].parent) {
              end_parent_flag = 1; 
              te1 = e; 
            }
          })
          if (end_parent_flag == 0){
            new_arr.forEach(f => {
              if (f.id == temp_mid_mid.parent) 
                root_flag = 1; 
            })
            if (root_flag == 0) {
              tem_root.forEach(graph => {
                if (graph.id == temp_mid_mid.parent && search_flag == 1) 
                  new_arr.push(graph); 
              })
            }


            root_flag = 0; 
            if (search_flag == 1)
              new_arr.push(temp_mid_mid); 
          }


          if (search_flag == 1)
            new_arr.push(tem_root[i]); 
          end_parent_flag = 0; 
        }
      }
    }
    const newArr1 = {graph: new_arr, links:links_data}; 
    const all_data = {graph: tem_root, links: links_data}; 
    const origin_data = {graph: graph_data_origin, links: links_data}; // origin_data
    
    

    if (search_key){
      return (
        <List
          sections={newArr1}
          sections_all={all_data}
          sections_origin={origin_data}
          unchecked={unchecked}
          sectionsColl={sectionsColl}
          sectionsSort={sectionsSort}
          sorted={sorted}
          onSortSection={this.handleSortSection}
          onCollSection={this.handleCollSection}
          onChckSection={this.handleChckSection}
          // onChckGroup={this.handleChckGroup}
          onChckFeature={this.handleChckFeature}
          onClickItem={this.props.onClickItem}
          legend={this.props.legend}
          onTickChange={this.props.onTickChange}
        />
      );
    }
    else 
      return (
        <List
          sections={all_data}
          sections_all={all_data}
          sections_origin={origin_data}
          unchecked={unchecked}
          sectionsColl={sectionsColl}
          sectionsSort={sectionsSort}
          sorted={sorted}
          onSortSection={this.handleSortSection}
          onCollSection={this.handleCollSection}
          onChckSection={this.handleChckSection}
          // onChckGroup={this.handleChckGroup}
          onChckFeature={this.handleChckFeature}
          onClickItem={this.props.onClickItem}
          legend={this.props.legend}
          onTickChange={this.props.onTickChange}

        />
      );
  }
  set_style = (size) => {
    if (this.props.configs.legendShow) {
        return { 
          height: size, 
          minWidth: CONFIGS.DEFAULT_LEGEND_MIN_WIDTH, 
          maxWidth: this.props.configs.legendMaxWidth || CONFIGS.DEFAULT_LEGEND_MAX_WIDTH, 
          width: this.props.configs.legendWidth || CONFIGS.DEFAULT_CONFIGS.legendWidth
      }
    }
    else return {
      width: 0, 
      opacity: 0
    }
  }

  render() {
    var size = this.props.win_size; 
    const style = this.set_style(size);
    const width_change = document.querySelector('.legend'); 
    return (
      <LegendMenuStyled vertical id="view-map-legend-menu" className="legend" style={style}>
        {this.renderSearchBar()}
        {this.renderControls()}
        {this.renderList()}
      </LegendMenuStyled>
    );
  }
}
