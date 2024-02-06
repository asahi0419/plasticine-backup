import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isEmpty } from 'lodash/lang';
import { map } from 'lodash/collection';

import Timeline, { TimelineHeaders, SidebarHeader, DateHeader } from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import DOMPurify from 'dompurify';
import merge from 'deepmerge';

import * as CONFIGS from './configs';
import * as Controls from './controls';
import Legend from './legend';
import ViewCalendarStyled from './styles';
import * as HELPERS from '../../../../../helpers';
import PlasticineApi from '../../../../../api';
import Record from '../../../../../sandbox/api/p/record';
import Loader from '../../../../shared/loader';
import FormModal from '../../../../shared/form-modal';
import SearchBar from './search';
import * as SELECTOR from './selector';

const ShowMoreStyled = styled.div`
  .show-more {
    display: flex;

    .show-more-button {
      height: 29px;
      line-height: 29px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
      cursor: pointer;
      padding-left: 10px;
      padding-right: 10px;
      border-radius: 4px;

      &:hover {
        background-color: lightgrey;
      }
    }
  }
`;

export default class ViewCalendar extends Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      fields: PropTypes.array.isRequired,
      actions: PropTypes.array.isRequired,
      view: PropTypes.object.isRequired,
      viewOptions: PropTypes.object.isRequired,
    }),

    configs: PropTypes.shape({
      showModelName: PropTypes.bool,
      showFilterManager: PropTypes.bool,
      showQuicksearch: PropTypes.bool,
      showHeaderMenu: PropTypes.bool,
      withAutorefresh: PropTypes.shape({
        options: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
        rate: PropTypes.number.isRequired,
      }),
      withMetadata: PropTypes.shape({
        options: PropTypes.array.isRequired,
        enabled: PropTypes.bool.isRequired,
      }),
    }),

    callbacks: PropTypes.shape({
      handleAction: PropTypes.func.isRequired,
      updateView: PropTypes.func.isRequired,
      updateUserSettings: PropTypes.func.isRequired,
    }),
  }

  static contextTypes = {
    sandbox: PropTypes.object,
  }

  constructor(props) {
    super(props);

    const { viewOptions = {} } = props.props;
    const { appearance = [] } = viewOptions;
    const { options = {} } = appearance;

    this.state = {
      loading: true,
      form: null,
      configs: CONFIGS.DEFAULT_CONFIGS,
      viewTypeOffset: 0,
      selectedResources: [],
      resourcePage: 1,
      maxTileHeight: 30,
      timelineSelected: [],
      viewType: CONFIGS.VIEW_TYPES[options['default-view']] || 'week',
    };

    this.id = `calendar-${HELPERS.makeUniqueID()}`;
    this.timeoutOpenForm = null;
    this.clickTimeout = null;
  }

  componentDidMount = () => {
    this.updateView({});
    this.setSize(this.state);
    if (this.state.viewType == 'week') this.updateView({});
  }

  componentDidUpdate = (prevProps, prevState) => {
    this.setSize(this.state);
  }

  setSize = ({ configs }) => {
    const content = document.querySelector(`#${this.id} .view-calendar-content`);

    if (!content) return;

    if (configs.legendShow) {
      content.style.left = `${configs.legendWidth}px`;
      // content.style.width = `${configs.contentWidth}px`;
    } else {
      content.style.removeProperty('left');
      // content.style.removeProperty('width');
    }

    this.fixMainHeaderForWeek();
    // this.map.resize();
  }

  fixMainHeaderForWeek() {
    // fix first header for week view - need move on one day to right
    // because react-calendar-timeline has not setting for moment library, and it always start week from Sunday
    if (this.state.viewType != 'week') return;

    const subHeader = document.querySelector('.rct-calendar-header > div:nth-of-type(2) .rct-dateHeader')
    const subHeaderWidth = subHeader.style.width;
    const subHeaderWidthNumber = Number(subHeaderWidth.replace('px', ''));

    const mainHeader = document.querySelector('.rct-calendar-header > div:nth-of-type(1)');
    const mainColumns = mainHeader.children;

    map(mainColumns, col => {
      const left = col.style.left;
      const leftNum = Number(left.replace('px', ''));
      col.style.left = `${leftNum + subHeaderWidthNumber}px`;
    });
  }

  processResources(resources) {
    const { records = [], title } = resources;
    let result = [];
    for (const record of records) {
      result.push({
        id: record.attributes.id,
        title: this.formatResourceTitle(record, title)
      });
    };
    return result;
  }

  processItems(data) {
    let items = [];
    map(data, (dataObj, dataIndex) => {
      const { records = [], resource, modelAlias } = dataObj;
      const { tile: { rows = this.defaultTileTemplate(), props = {}, tile_height = 30, tile_mode = 'time' } } = dataObj;
      const { side = {}, background = {}, border = {} } = props;

      map(records, record => {
        const sideOpt = this.selectOpt(side, record);
        const backgroundOpt = this.selectOpt(background, record);
        const borderOpt = this.selectOpt(border, record);
        const availableProcess = this.isAvailableItem(record, dataObj);

        if (availableProcess) {
          items.push({
            id: `${modelAlias}:${record.attributes.id}`,
            modelAlias: modelAlias,
            recordId: record.attributes.id,
            record: new Record(record),
            tile_mode,
            dataIndex,
            group: record.attributes[resource],
            title: this.formatTile(record, rows),
            originalStart: this.originalStart(record, dataObj),
            originalEnd: this.originalEnd(record, dataObj),
            start_time: this.calculateStart(record, dataObj, tile_mode),
            end_time: this.calculateEnd(record, dataObj, tile_mode),
            bgColor: backgroundOpt.color || '#FFFFFF',
            selectedBgColor: '#FF0000',
            itemProps: {
              "data-border-width": borderOpt.width || 1,
              "data-border-color": borderOpt.color || '#000000',
              "data-side-color": sideOpt.color || '#FFFFFF',
              "data-tile-height": tile_height,
            },
            canMove: true
          });
        }
      });
    });
    return items;
  }

  selectOpt = (obj, record) => {
    const options = obj.options || [];
    const selected = options.filter(({ recordIds }) => recordIds.includes(record.attributes.id));
    return selected[0] || {};
  }

  maxTileHeight(items) {
    if (lodash.isEmpty(items)) return 30;

    return lodash.max(
      lodash.map(items, ({ itemProps }) => {
        return itemProps["data-tile-height"];
      })
    );
  }

  itemRenderer = ({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
    const background = item.bgColor;
    const borderColor = item.itemProps['data-border-color'];
    const borderWidth = item.itemProps['data-border-width'];
    const tileHeight = item.itemProps['data-tile-height'];
    const { dimensions: { width: itemWidth } } = itemContext;
    const sideWidth = itemWidth < 30 ? 5 : 10;
    const props = getItemProps({
      style: {
        background,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: 7
      },
      // onDoubleClick: () => {
      //   this.openForm(item);
      // }
    });
    props.style.height = tileHeight;

    return (
      <div {...props}
        onMouseEnter={ () =>
          this.setState({ timelineSelected: [...this.state.timelineSelected, item.id] })
        }
        onMouseLeave={ () =>
          this.setState({ timelineSelected: this.state.timelineSelected.filter(id => id !== item.id) })
        }
      >
        <div style={{
          borderRadius: '4px 0px 0px 4px',
          background: item.itemProps['data-side-color'],
          width: `${sideWidth}px`,
          maxWidth: '10px',
          height: tileHeight - 2 * Number(borderWidth),
          display: 'inline-block',
          float: 'left'
        }}></div>
        <div className="calendar-tile"
          style={{
            height: tileHeight - 5,
            paddingLeft: 3,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(itemContext.title)}}
        >
        </div>
      </div>
    );
  }


  handleChangeState = (section, state) => {
    const sectionState = { ...this.state[section], ...state };
    this.setState({ [section]: sectionState });
  }

  openForm(item, timeout = CONFIGS.DEFAULT_EVENT_TIMEOUT) {
    if (item) {
      clearTimeout(this.timeoutOpenForm);
      this.timeoutOpenForm = setTimeout(() => {
        this.setState({ form: item });
      }, timeout);
    }
  }

  isAvailableItem (record, dataObj) {
    const { duration } = dataObj;
    if (!lodash.isEmpty(duration)) return true;
    if (lodash.isEmpty(dataObj.end)) return true;
    
    const endDate = moment(record.attributes[dataObj.end]);
    const startDate = moment(record.attributes[dataObj.start]);
    return startDate <= endDate;
  }

  originalStart(record, dataObj) {
    return moment(record.attributes[dataObj.start]);
  }

  originalEnd(record, dataObj) {
    return moment(record.attributes[dataObj.end]);
  }

  calculateStart(record, dataObj, tile_mode) {
    const startDate = moment(record.attributes[dataObj.start]);

    if (tile_mode == 'day' && this.state.viewType != 'day') {
      return startDate.startOf('day');
    }
    return startDate;
  }

  calculateEnd(record, dataObj, tile_mode) {
    if (tile_mode == 'day' && this.state.viewType != 'day') {
      return moment(record.attributes[dataObj.end]).endOf('day');
    }

    if (!isEmpty(dataObj.end)) {
      return moment(record.attributes[dataObj.end]);
    } else {
      const { duration = 120 } = dataObj;
      return moment(record.attributes[dataObj.start]).add(duration, 'minute');
    }
  }

  defaultTileTemplate() {
    return `<p style="color:#000000; font-size:10px; text-align:left">{{id}}</p >`;
  }

  formatTile(record, rows) {
    const tileElements = rows.match(/{{(.*?)}}/g);
    let str = rows;
    map(tileElements, el => {
      const fieldAlias = el.replace(/{{|}}/g, '');
      const val = this.recordHumanAttribute(fieldAlias, record);
      str = str.replace(el, val || '');
    });
    return str;
  }

  recordHumanAttribute(fieldAlias, record) {
    const field = record.fieldsMap[fieldAlias];
    if (field && field.type == 'fa_icon') {
      return `<i class="${record.attributes[fieldAlias]} icon"></i>`;
    }
    return record.humanizedAttributes[fieldAlias] || record.attributes[fieldAlias];
  }

  formatResourceTitle(record, title) {
    const titleElements = title.match(/{(.*?)}/g);
    let str = title;
    map(titleElements, el => {
      const fieldAlias = el.replace(/{|}/g, '');
      const val = record.attributes[fieldAlias];
      str = str.replace(el, val || '');
    });
    return str;
  }

  renderModal = () => {
    if (this.state.form) {
      return (
        <FormModal
          parent={{ type: 'view', vtype: 'map', alias: this.props.props.view.alias, id: this.props.props.view.id }}
          modelAlias={this.state.form.modelAlias}
          recordId={this.state.form.recordId}
          onClose={() => this.setState({ form: null })}
          opened={true}
          fullMode={false}
        />
      );
    }
  }

  renderControls = () => {
    return (
      <div className="view-calendar-controls">
        <Controls.ActionControl
          configs={this.state.configs}
          viewType={this.state.viewType}
          loading={this.state.loading}
          actions={{
            onToggleClick: () => this.handleChangeState('configs', { legendShow: !this.state.configs.legendShow }),
            onTodayClick: () => this.handleViewTypeOffset(0),
            onPreviousClick: () => this.handleViewTypeOffset(-1),
            onNextClick: () => this.handleViewTypeOffset(1),
            onMonthClick: () => this.handleViewType('month'),
            onWeekClick: () => this.handleViewType('week'),
            onDayClick: () => this.handleViewType('day'),
          }}
        />
      </div>
    );
  }

  renderLegend = (data) => {
    return (
      <Legend
        data={data}
        configs={this.state.configs}
        onChange={this.handleChangeState}
      />
    );
  }

  updateView = (params) => {
    const { viewOptions = {} } = this.props.props;
    const { appearance = [] } = viewOptions;
    if (isEmpty(appearance)) { return null; }

    params.resourcePage = params.resourcePage || 1;
    this.setState({ ...params, loading: true });
    const needSavePage = params.resourcePage > 1;
    const merger = { arrayMerge: (t, s) => lodash.uniqWith([ ...t, ...s ], (te, se) => te.id === se.id) };

    SELECTOR.selectData(appearance, this.state, params)
      .then((res) => {
        const { data, resources = {}, dateStart, dateEnd } = res;
        const { searchBarModel, searchBarLabel, search_placeholder } = resources;
        const items = merge(needSavePage ? this.state.items : {}, this.processItems(data), merger);

        const newState = {
          groups: merge(needSavePage ? this.state.groups : {}, this.processResources(resources), merger),
          items,
          maxTileHeight: this.maxTileHeight(items),
          resources: { searchBarModel, searchBarLabel, search_placeholder },
          dateStart,
          dateEnd,
          meta: appearance,
        };
        this.setState({ ...newState, loading: false });
      });
  }

  handleViewTypeOffset = (offset) => {
    this.updateView({ viewTypeOffset: offset == 0 ? 0 : this.state.viewTypeOffset + offset });
  }

  handleViewType = (viewType) => {
    this.updateView({ viewType, viewTypeOffset: 0 });
  }

  showMoreResources = () => {
    this.updateView({ resourcePage: this.state.resourcePage + 1 });
  }

  handleSearchBar = (_, { value }) => {
    this.updateView({ selectedResources: value });
  }

  renderSearchBar = (resources) => {
    const fieldForInput = {
      options: {
        foreign_model: resources.searchBarModel,
        foreign_label: resources.searchBarLabel,
        view: 'default',
      }
    };

    const placeholder = resources.search_placeholder || 'Type a value';

    return (
      <SearchBar
        field={fieldForInput}
        value={this.state.selectedResources}
        placeholder={placeholder}
        onChange={this.handleSearchBar}
      />
    );
  }

  renderShowMore = () => {
    if (!lodash.isEmpty(this.state.selectedResources)) return;

    const showMoreTitle = i18n.t('show_more', { defaultValue: 'Show more' });

    return (
      <ShowMoreStyled>
        <div className='show-more'>
          <div
            onClick={() => this.showMoreResources()}
            className='show-more-button'
            title={showMoreTitle}
          >{showMoreTitle}
          </div>
        </div>
      </ShowMoreStyled>
    );
  }

  dateHeaderLabelFormat = (interval, unit, labelWidth) => {
    switch (unit) {
      case 'month':
        return interval[0].format('MMMM YYYY');
      case 'week':
        const startDate = interval[0].add(1, 'day').format('MMMM DD');
        const endDate = interval[1].format('DD')
        return `${startDate} - ${endDate}`;
      case 'day':
        return interval[0].format('dddd, LL');
    }
  }

  getActions = (attributes = {}, target = {}) => {
    const context = { modelId: this.props.props.model.id };
    const sandbox = new Sandbox ({
      user: this.context.sandbox.context.user,
      uiObject: {
        attributes: {
          ...target,
          __type: 'calendar',
          meta: this.state.meta,
          updateFunction: this.updateTiles,
        },
        parent: (this.context.sandbox.getContext() || {}).this,
      },
    });
    const actions = lodash.filter(this.props.props.actions, attributes);
    const actionsAvailable = lodash.filter(actions, (a = {}) => a.group || sandbox.executeScript(a.condition_script, context, `action/${a.id}/condition_script`));
    const actionsOrdered = lodash.orderBy(actionsAvailable, ['id'], ['asc']);
    return lodash.map(actionsOrdered, (a = {}) => {                                                                                                                                                                                                                                                                                                                                                                         
      const result = { ...a, executeScript: {} };
      result.executeScript.client = () => sandbox.executeScript(a.client_script, context, `action/${a.id}/client_script`);
      return result;
    });
  }

  updateTiles = async (tilesArray) => {
    await Promise.all(
      map(tilesArray, async tileObj => {
        const { attributes = {} } = tileObj;
        const { record, model } = attributes;
        if (record) {
          if (record.id) {
            await PlasticineApi.updateRecord(
              model,
              record.id,
              { data: { attributes: record } }
            );
          } else {
            await PlasticineApi.createRecord(
              model,
              { data: { attributes: record } }
            );
          }
        }
      })
    );
    this.updateView({});
  }

  runAction = async (params) => {
    const actions = this.getActions({ type: 'calendar_action' }, params);

    if (!lodash.isEmpty(actions[0])) {
      const action = actions[0];
      let options = {};
      let result = false;

      if (action.executeScript?.client) {
        result = await action.executeScript.client();

        if (typeof result === 'object') {
          if (result.result === true) {
            options.ui_params = result.ui_params;
            result = true;
          }
        }
      }

      if (result && action.executeScript?.server) {
        action.executeScript.server(options);
      }
    }
  }

  onCanvasClick = (groupId, time, event) => {
    this.runAction({
      action: 'click',
      objectType: 'cell',
      groupId, // change to group
      time, // change to startDate, endDate
      event
    });
  }

  onItemClick = (itemId, event, time) => {
    clearTimeout(this.clickTimeout);
    this.clickTimeout = setTimeout(() => {
      this.runAction({
        action: 'click',
        objectType: 'tile',
        itemId,
        item: lodash.find(this.state.items, { id: itemId }),
        event,
        time
      });
    }, 250);
  }

  onItemDoubleClick = (itemId, e, time) => {
    clearTimeout(this.clickTimeout);
    const item = lodash.find(this.state.items, { id: itemId });
    this.openForm(item);
  }

  onItemMove = (itemId, dragTime, newGroupOrder) => {
    const item = lodash.find(this.state.items, { id: itemId });

    this.runAction({
      action: 'change',
      objectType: 'tile',
      itemId,
      item,
      dragTime,
      newGroup: this.state.groups[newGroupOrder],
      newCells: this.prepareCells(dragTime, item)
    });
  }

  prepareCells = (time, item) => {
    let newStartDate = moment(time);
    const endDate = moment(item.originalEnd).add(newStartDate - item.originalStart);
    const diffTime = this.state.viewType == 'day' ? 'hours' : 'days';
    let countDate = newStartDate;
    let cells = [];

    while (countDate < endDate) {
      const newEndDate = moment(countDate).add(1, diffTime);
      cells.push({
        startDate: moment(countDate),
        endDate: (newEndDate > endDate) ? endDate : newEndDate
      });
      countDate.add(1, diffTime);
    }
    return cells;
  }

  renderContentWithResources() {
    if (lodash.isEmpty(this.state.groups)) return <Loader />;

    const { resources, dateStart, dateEnd } = this.state;
    const defaultTimeStart = moment(dateStart).valueOf();
    const defaultTimeEnd = moment(dateEnd).valueOf();

    const defaultTimeRange = defaultTimeEnd - defaultTimeStart;

    return (
      <div className="view-calendar-content">
        <Timeline
          selected={this.state.timelineSelected}
          groups={this.state.groups}
          items={this.state.items}
          visibleTimeStart={defaultTimeStart}
          visibleTimeEnd={defaultTimeEnd}
          stackItems
          lineHeight={this.state.maxTileHeight}
          itemHeightRatio={1}
          itemRenderer={this.itemRenderer}
          sidebarWidth={300}
          minZoom={defaultTimeRange}
          maxZoom={defaultTimeRange}
          onCanvasClick={this.onCanvasClick}
          onItemClick={this.onItemClick}
          onItemDoubleClick={this.onItemDoubleClick}
          onItemMove={this.onItemMove}
          itemTouchSendsClick={true}
        >
          <TimelineHeaders className="sticky">
            <SidebarHeader>
              {({ getRootProps }) => this.renderSearchBar(resources)}
            </SidebarHeader>
            <DateHeader
              unit={this.state.viewType}
              labelFormat={this.dateHeaderLabelFormat}
            />
            <DateHeader labelFormat={CONFIGS.DATE_HEADER_FORMAT[this.state.viewType]} />
          </TimelineHeaders>
        </Timeline>
        {this.renderShowMore()}
      </div>
    );
  }

  renderCalendarWithResources(data) {
    if (this.state.loading) return <Loader />;

    return (
      <div>
        {this.renderLegend(data)}
        {this.renderContentWithResources()}
        {this.renderModal()}
      </div>
    );
  }

  render() {
    if (!this.props.ready) return <Loader />;

    const { viewOptions = {} } = this.props.props;
    const { appearance = [] } = viewOptions;
    if (isEmpty(appearance)) { return null; }

    const { data } = appearance;

    if (!isEmpty(appearance.resources)) {
      return (
        <ViewCalendarStyled id={this.id} className="view-calendar">
          {this.renderControls()}
          {this.renderCalendarWithResources(data)}
        </ViewCalendarStyled>
      )
    } else {
      // will be done in Ph2
    }
  }
}
