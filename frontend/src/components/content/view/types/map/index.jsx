import qs from 'qs';
import React from 'react';
import lodash from 'lodash';
import Promise from 'bluebird';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { Deck, MapView } from '@deck.gl/core';

import Legend from './legend';
import Layers from './layers';
import ViewMapStyled from './styles';
import * as Controls from './controls';

import Tip from './tip';
import Progress from '../../../../shared/progress';
import FormModal from '../../../../shared/form-modal';
import ContextMenu from './context-menu';

import Sandbox from '../../../../../sandbox';
import * as HELPERS from '../../../../../helpers';
import * as CONFIGS from './configs';
import * as MAP_VIEW_HELPERS from './helpers';

export default class ViewMap extends React.Component {
  static propTypes = {
    props: PropTypes.shape({
      model: PropTypes.object.isRequired,
      view: PropTypes.object.isRequired,
      actions: PropTypes.array.isRequired,
      appearance: PropTypes.object.isRequired,
      viewOptions: PropTypes.object.isRequired,
      features: PropTypes.array.isRequired,
      sections: PropTypes.array.isRequired,
      groups: PropTypes.array.isRequired,
      properties: PropTypes.object.isRequired,
    }),
  }

  static contextTypes = {
    getCache: PropTypes.func,
    setCache: PropTypes.func,
    sandbox: PropTypes.object,
  }

  get node() {
    return ReactDOM.findDOMNode(this);
  }

  constructor(props, context) {
    super(props);

    this.state = {
      data: CONFIGS.DEFAULT_DATA,
      events: CONFIGS.DEFAULT_EVENTS,
      configs: CONFIGS.DEFAULT_CONFIGS,
      viewState: CONFIGS.DEFAULT_VIEW_STATE,
      legend: CONFIGS.DEFAULT_LEGEND,
      draw: CONFIGS.DEFAULT_DRAW,

      contextMenu: null,
      progress: null,
      form: null,
      tip: null,
    };

    this.id = `map-${HELPERS.makeUniqueID()}`;
    this.idMap = `${this.id}-map`;
    this.idCanvas = `${this.id}-deck-canvas`;

    this.clearTimeout = () => this.timeout && clearTimeout(this.timeout);
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.setState);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    const state = this.getStateCache(this.props)
               || this.getState(this.props, { initial: true });

    this.setMap(state);
    this.setLayers(state);
    this.setState(state);
    this.setSize(state);

    document.getElementById(this.idCanvas).addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
    document.getElementById(this.idCanvas).addEventListener('mousemove', (e) => {
      if (e.which === 3) this.rightButton = true
    })
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.setState);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.setStateCache();
    this.clearTimeout();
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.children/* Loader */) return;

    const state = this.getState(nextProps);

    if (state.context === this.state.context) {
      this.setLayers(state);
      this.setState(lodash.omit(state, ['configs', 'viewState']));
    } else {
      this.handleChangeViewState(state.viewState, { initial: true });
      this.setLayers(state);
      this.setState(state);
      this.setSize(state);
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.configs.fullScreen !== prevState.configs.fullScreen) {
      this.setSize(this.state);
    }

    if (this.state.configs.legendShow !== prevState.configs.legendShow) {
      this.setSize(this.state);
    }

    if (this.state.configs.legendWidth !== prevState.configs.legendWidth) {
      this.setSize(this.state);
    }

    if (this.state.configs.contentHeight !== prevState.configs.contentHeight) {
      this.setSize(this.state);
    }

    if (this.state.configs.source !== prevState.configs.source) {
      this.map.setStyle(CONFIGS.MAP_STYLES_BY_SOURCE[this.state.configs.source]);
    }

    if (!lodash.isEqual(this.state.legend.unchecked.f, prevState.legend.unchecked.f)) {
      this.setLayers(this.state);
    }
    
    if (!lodash.isEqual(this.state.draw.mode, prevState.draw.mode)) {
      this.setLayers(this.state);
    }

    if (!lodash.isEqual(this.state.draw.selection, prevState.draw.selection)) {
      this.setLayers(this.state);
    }

    if (!lodash.isEqual(this.state.draw.hovering, prevState.draw.hovering)) {
      this.setLayers(this.state);
    }

    this.setUIObject(this.state);
  }

  get query() {
    return qs.parse(window.location.search.replace(/^\?/, '')) || {};
  }

  getState = (props, params = {}) => {
    const state = {};

    state.draw = this.getDraw(props);
    state.data = this.getData(props, state);
    state.events = this.getEvents(props);
    state.configs = this.getConfigs(props);
    state.viewState = this.getViewState(props, state);
    state.legend = this.getLegend(props);
    state.context = this.getContext(props, params);

    return state;
  }

  getStateCache = (props) => {
    const cache = this.context.getCache('view/map/state');
    if (cache) return { ...cache, data: this.getData(props) };
  }

  setStateCache = () => {
    const viewState = lodash.pick(this.deck.props.viewState, CONFIGS.BOUND_POSITION_KEYS);
    const legend = { ...this.state.legend };

    this.context.setCache('view/map/state', { ...lodash.omit(this.state, ['data']), viewState, legend });
  }

  getDraw = (props) => {
    const { actions, viewOptions, properties = {} } = props.props;
    const { embedded_to = {} } = viewOptions;
    const result = lodash.cloneDeep(CONFIGS.DEFAULT_DRAW);

    if (lodash.find(actions, { alias: 'map_draw' })) {
      if (embedded_to.record_id) {
        if (properties['draw-enable']) {
          result.enable = true;
        }
      }
    }

    return result;
  }

  getData = (props) => {
    let features = props.props.features;
    let sections = props.props.sections;
    let groups = props.props.groups;
    let properties = props.props.properties;

    return {
      ...CONFIGS.DEFAULT_DATA,
      features,
      sections,
      groups,
      properties,
    };
  }

  getEvents = (props) => {
    const options = HELPERS.parseOptions(props.props.appearance.options);
    const events = {};

    const click = options['click'];
    if (lodash.isObject(click)) events.click = click;
    const hover = options['hover'];
    if (lodash.isObject(hover)) events.hover = hover;

    return { ...CONFIGS.DEFAULT_EVENTS, ...events };
  }

  getConfigs = (props) => {
    const options = HELPERS.parseOptions(props.props.appearance.options);
    const configs = { ...CONFIGS.DEFAULT_CONFIGS };

    const cluster = options['cluster'];
    if (lodash.isBoolean(cluster)) configs.cluster = cluster;
    const source = options['view-state'] && options['view-state']['source'] ? options['view-state']['source'] : CONFIGS.DEFAULT_CONFIGS.source;
    if (lodash.isString(source)) configs.source = source;
    const exclude = options['exclude'];
    if (lodash.isArray(exclude)) configs.exclude = exclude;
    const freeze = options['view-state'] && options['view-state']['freeze'] ? options['view-state']['freeze'] : CONFIGS.DEFAULT_CONFIGS.freeze;
    if (lodash.isBoolean(freeze)) configs.freeze = freeze;
    const legendShow = options['legend-show'];
    if (lodash.isBoolean(legendShow)) configs.legendShow = legendShow;
    const legendWidth = options['legend-width'];
    if (lodash.isBoolean(legendWidth)) configs.legendWidth = legendWidth;

    const isHideScale = options['controls'] && options['controls']['scale'] && options['controls']['scale']['hide']  ? options['controls']['scale']['hide'] : CONFIGS.DEFAULT_CONFIGS.scale.hide;
    if (lodash.isBoolean(isHideScale)) configs.isHideScale = isHideScale;
    
    const canvasWidth = this.node.parentElement.clientWidth
    if (props.props.context === 'embedded_view') {
      if (canvasWidth < CONFIGS.DEFAULT_LEGEND_MAX_WIDTH * 2) {
        configs.legendMaxWidth = canvasWidth / 2
        configs.legendWidth = canvasWidth / 2
      }
      if (canvasWidth < CONFIGS.DEFAULT_LEGEND_MIN_WIDTH * 2) {
        configs.legendShow = false
      }
    }

    configs.contentWidth = this.node.parentElement.clientWidth - configs.legendWidth;
    configs.contentHeight = this.node.parentElement.clientHeight;

    return configs;
  }

  getViewState = (props, state) => {
    const options = HELPERS.parseOptions(props.props.appearance.options);
    const viewState = MAP_VIEW_HELPERS.getViewStateByFeatures(state.data.features, state.configs);

    if (lodash.isObject(options['view-state'])) {
      lodash.each(CONFIGS.BOUND_POSITION_KEYS, (key) => {
        if (lodash.isNumber(options['view-state'][key])) {
          viewState[key] = options['view-state'][key]
        }
      });
    }

    return { ...CONFIGS.DEFAULT_VIEW_STATE, ...viewState };
  }

  getLegend = (props) => {
    const options = HELPERS.parseOptions(props.props.appearance.options);

    const uncheckedSections = lodash.filter(props.props.sections, (sc) => sc.selected === false);
    const uncheckedSectionsIds = lodash.map(uncheckedSections, 'id');

    const uncheckedGroups = lodash.filter(props.props.groups, (gr) => gr.selected === false);

    const unselectedFeatures = lodash.filter(props.props.features, (ft) => {
      if (!ft.properties['p-legend'])
        return false;
      const index = lodash.findIndex(uncheckedGroups, { 'id': ft.properties.group, 'section': ft.properties.section });
      if(index > -1)
        return true;
    });

    const legend = {
      ...lodash.cloneDeep(CONFIGS.DEFAULT_LEGEND),
      unchecked: {
        f: lodash.map(unselectedFeatures, 'id'),
        s: lodash.uniq(uncheckedSectionsIds),
        g: lodash.map(uncheckedGroups, (i) => lodash.pick(i, 'id', 'section')),
      },
    };

    if (lodash.isObject(options['legend'])) {
      lodash.each(options['legend'], (key) => {
        legend[key] = options['legend'][key];
      });
    }

    lodash.each(props.props.sections, (section) => {
      if (section.hasOwnProperty('expand')) {
        if (section.expand === false) {
          legend.sectionsColl.push(section.id);
        }
      }
    })

    return legend;
  }

  getContext = (props, params = {}) => {
    const { view, viewOptions } = props.props;
    const { embedded_to = {} } = viewOptions;

    if (embedded_to.record_id) {
      return `${view.id}-${embedded_to.record_id}`
    }

    if (!params.initial) {
      return `${view.id}`;
    }
  }

  getActions = (attributes = {}, target = {}) => {
    const { object = {}, coordinate = [] } = target;
    const { geometry = {} } = object;

    const sandbox = new Sandbox({
      user: this.context.sandbox.context.user,
      uiObject: {
        parent: (this.context.sandbox.getContext() || {}).this,
        attributes: {
          ...object,
          geometry,
          __type: 'feature',
          event: {
            coordinates: geometry.type === 'Point'
              ? MAP_VIEW_HELPERS.roundCoordinates(geometry.coordinates)
              : MAP_VIEW_HELPERS.roundCoordinates(coordinate),
          },
        },
      },
    });

    const context = { modelId: this.props.props.model.id };
    const actions = lodash.filter(this.props.props.actions, attributes);
    const actionsAvailable = lodash.filter(actions, (a = {}) => a.group || sandbox.executeScript(a.condition_script, context, `action/${a.id}/condition_script`));
    const actionsOrdered = lodash.orderBy(actionsAvailable, ['position'], ['desc']);

    return lodash.map(actionsOrdered, (a = {}) => {
      const { props, callbacks } = this.props;

      if (a.group) return a;

      const result = { ...a, executeScript: {} };
      if (a.client_script) result.executeScript.client = () => sandbox.executeScript(a.client_script, context, `action/${a.id}/client_script`);
      if (a.server_script) result.executeScript.server = (options = {}) => callbacks.handleAction(props.model, a, { ...options, sandbox });
      return result;
    });
  }

  getEventActions = (attributes = {}, params = {}) => {
    const { target = {}, action } = params;

    const sandbox = new Sandbox({
      user: this.context.sandbox.context.user,
      uiObject: {
        attributes: { ...target, __type: 'feature' },
        parent: (this.context.sandbox.getContext() || {}).this,
      },
    });

    const { this: uiObject } = sandbox.getContext()
    uiObject.getAction = () => action;

    const context = { modelId: this.props.props.model.id };
    const actions = lodash.filter(this.props.props.actions, attributes);
    const actionsAvailable = lodash.filter(actions, (a = {}) => a.group || sandbox.executeScript(a.condition_script, context, `action/${a.id}/condition_script`));
    const actionsOrdered = lodash.orderBy(actionsAvailable, ['position'], ['desc']);

    return lodash.map(actionsOrdered, (a = {}) => {
      const { props, callbacks } = this.props;

      if (a.group) return a;

      const result = { ...a, executeScript: {} };
      if (a.client_script) result.executeScript.client = () => sandbox.executeScript(a.client_script, context, `action/${a.id}/client_script`);
      if (a.server_script) result.executeScript.server = (options = {}) => callbacks.handleAction(props.model, a, { ...options, sandbox, parallel: true });
      return result;
    });
  }

  getStyles = (configs) => {
    const styles = {
      'view-map-scale-control': {
        'display': 'block',
      },
    };

    if (configs.freeze || configs.isHideScale) {
      styles['view-map-scale-control'].display = 'none';
    }

    return styles;
  }

  setMap = ({ viewState, configs }) => {
    this.map = window.map = new mapboxgl.Map({
      container: this.idMap,
      style: CONFIGS.MAP_STYLES_BY_SOURCE[configs.source],
      center: [ viewState.longitude, viewState.latitude ],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch,
      preserveDrawingBuffer: !!this.query.export,
    });

    this.map.component = this;

    this.deck = window.deck = new Deck({
      canvas: this.idCanvas,
      views: new MapView({
        repeat: true,
      }),
      controller: { dragPan: true },
      glOptions: { preserveDrawingBuffer: !!this.query.export },
      width: '100%',
      height: '100%',
      viewState: viewState,
      initialViewState: viewState,
      onHover: this.handleDeckHover,
      onDrag: this.handleDrag,
      onDragStart: this.handleDragStart,
      onDragEnd: this.handleDragEnd,
      onViewStateChange: ({ viewState }) => this.handleChangeViewState(viewState),
      onClick: (info, event) => {
        return event.rightButton
          ? this.handleClick(info, event)
          : this.handleDeckClick(info, event)
      },
    });

    if (this.query.export) {
      this.map.on('error', (e) => {
        if (e.error) {
          console.log(e.error.message);

          clearTimeout(this.errorTimeout)
          this.errorTimeout = setTimeout(() => {
            this.map.fire('idle');
          }, 1000)
        }
      });
      this.map.once('idle', () => {
        const mc = this.map.getCanvas();
        const dc = this.deck.canvas;

        const merge = document.createElement('canvas');
        merge.width = mc.width;
        merge.height = mc.height;

        const context = merge.getContext('2d');
        context.globalAlpha = 1.0;
        context.drawImage(mc, 0, 0);
        context.globalAlpha = 1.0;
        context.drawImage(dc, 0, 0);

        const img = document.createElement('img');
        img.className = 'map-image';
        img.style = 'display:none';
        img.src = merge.toDataURL(`image/${this.query.export}`, 1);

        this.map.getCanvasContainer().appendChild(img);
      });
    }

    this.map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
  }

  setLayers = ({ data, configs, legend, draw }) => {
    const { unchecked } = legend || {};
    const { f: exclude = [] } = unchecked;

    this.deck.setProps({ layers: Layers({
      data,
      draw: { ...draw, properties: data.properties.draw },
      configs,
      exclude,
      zoom: this.deck.props.viewState.zoom,
      onClick: this.handleClick,
      onHover: this.handleHover,
      onEdit: this.handleEdit,
      onSelect: this.handleSelect,
    }) });
  }

  setSize = ({ data, configs }) => {
    const controls = document.querySelector(`#${this.id} .view-map-controls`);
    const content = document.querySelector(`#${this.id} .view-map-content`);

    if (configs.legendShow) {
      controls.style.left = `${configs.legendWidth}px`;
      content.style.left = `${configs.legendWidth}px`;
      content.style.width = `${configs.contentWidth}px`;
    } else {
      controls.style.removeProperty('left');
      content.style.removeProperty('left');
      content.style.removeProperty('width');
    }

    this.handleChangeViewState(MAP_VIEW_HELPERS.getViewStateByFeatures(data.features, configs));
    this.map.resize();
  }

  setUIObject = (state) => {
    const { this: uiObject = {} } = this.context.sandbox.getContext();

    Object.assign(uiObject, lodash.cloneDeep(state))
    uiObject.getOptions = () => {
      return {
        ...HELPERS.parseOptions(this.props.props.appearance.options),
        draw: this.state.draw,
      }
    };
    uiObject.getFeatures = () => {
      return uiObject.data.features || state.data.features || [];
    };
    uiObject.setFeatures = (features = []) => {
      if (lodash.isArray(features)) uiObject.data.features = features;
    };
    uiObject.getFeature = (search = {}) => {
      const features = uiObject.getFeatures();

      const section = search.section || 'default';
      const id = search.id;

      return id
        ? lodash.find(features, feature => feature.id === id && feature.properties.section === section)
        : lodash.find(features, feature => feature.properties.section === section);
    };
    uiObject.setFeature = (search = {}, feature) => {
      if (!feature) return false;
      if (!lodash.isObject(search)) return false;

      const featureFound = uiObject.getFeature(search);

      if (featureFound) {
        uiObject.data.features = uiObject.data.features || lodash.cloneDeep(state.data.features);
        var index = lodash.findIndex(uiObject.data.features, { id: featureFound.id });
        uiObject.data.features.splice(index, 1, feature);
        return true;
      }

      return false;
    };
    uiObject.setFeatures = (features = []) => {
      if (!lodash.isArray(features)) return;

      uiObject.data.features = features;
    };
    uiObject.addFeature = (feature) => {
      if (!feature) return false;

      uiObject.data.features = uiObject.data.features || lodash.cloneDeep(state.data.features);
      uiObject.data.features.push(feature);
      return true;
    };
    uiObject.removeFeature = (search = {}) => {
      if (!lodash.isObject(search)) return false;

      const featureFound = uiObject.getFeature(search);

      if (featureFound) {
        const oldFeatures = uiObject.data.features || lodash.cloneDeep(state.data.features);
        uiObject.data.features = lodash.filter(oldFeatures, ({ id }) => {
          return !(
            (id === featureFound.id)
         || (id === `${featureFound.id}:a`)
         || (id === `${featureFound.id}:b`)
          )
        });
        return true;
      }

      return false;
    };
    uiObject.addFreePoint = (inputCoordinates) => {
      const coordinates = MAP_VIEW_HELPERS.roundCoordinates(inputCoordinates);
      const feature = {
        id: HELPERS.makeUniqueID(),
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {
          ...uiObject.data.properties.draw.point.properties,
          'section': 'Free objects',
          'group': 'Free points',
          'editable': 'free',
          'p-legend': 1,
        },
      }

      uiObject.addFeature(feature);

      return feature;
    }
    uiObject.addFreeLine = (inputCoordinates) => {
      const coordinates = MAP_VIEW_HELPERS.roundCoordinates(inputCoordinates);
      const feature = {
        id: HELPERS.makeUniqueID(),
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          ...uiObject.data.properties.draw.line.properties,
          'section': 'Free objects',
          'group': 'Free lines',
          'editable': 'free',
          'p-legend': 1,
        },
      }

      const end_a = {
        id: `${feature.id}:a`,
        geometry: {
          type: 'Point',
          coordinates: lodash.first(coordinates),
        },
        properties: {
          ...uiObject.data.properties.draw.line.properties,
          'section': 'default',
          'follow-up': feature.id,
          'follow-up:editable': 'free',
          'p-text': 'A',
          'p-size-units': 'pixels',
          'p-marker-size': 0,
          'p-legend': 0,
        },
      }

      const end_b = {
        id: `${feature.id}:b`,
        geometry: {
          type: 'Point',
          coordinates: lodash.last(coordinates),
        },
        properties: {
          ...uiObject.data.properties.draw.line.properties,
          'section': 'default',
          'follow-up': feature.id,
          'follow-up:editable': 'free',
          'p-text': 'B',
          'p-size-units': 'pixels',
          'p-marker-size': 0,
          'p-legend': 0,
        },
      }

      const options = uiObject.getOptions()

      if (options.show_ab_ends) {
        feature.properties['followed-by'] = [
          end_a.id,
          end_b.id,
        ]

        uiObject.addFeature(end_a);
        uiObject.addFeature(end_b);
      }

      uiObject.addFeature(feature);

      return feature;
    };
    uiObject.update = (params = {}) => {
      const { withState = true } = params;
      
      try {
        const data = { ...this.state.data, features: uiObject.getFeatures() };

        this.setLayers({ ...this.state, data });
        if (withState) this.setState({ data });

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    };
    uiObject.rebuildCache = () => {
      return false;
    };
  }

  handleKeyDown = (e) => {
    const { draw } = this.state;

    if (draw.enable) {
      if (['MetaLeft', 'MetaRight'].includes(e.code) || e.keyCode === 17) {
        this.handleChangeState('draw', { multiselect: true });
      }

      if (draw.selection.length) {
        if (['Backspace', 'Delete'].includes(e.code)) {
          this.handleDrawSelectionDelete(draw.selection);
        }

        if (['Escape'].includes(e.code)) {
          this.handleChangeState('draw', { selection: [] });
        }
      }

      if (draw.mode) {
        if (['Escape'].includes(e.code)) {
          this.deck.setProps({ getCursor: () => 'default' });
          this.handleChangeState('draw', { mode: null });
        }
      }
    }
  }

  handleKeyUp = (e) => {
    const { draw } = this.state;

    if (draw.enable) {
      if (['MetaLeft', 'MetaRight'].includes(e.code) || e.keyCode === 17) {
        this.handleChangeState('draw', { multiselect: false });
      }
    }
  }

  handleChangeState = (section, state) => {
    const sectionState = { ...this.state[section], ...state };
    this.setState({ [section]: sectionState });
  }

  handleChangeViewState = (state, params = {}) => {
    if (this.state.configs.freeze) return;

    const viewState = lodash.pick({ ...this.deck.props.viewState, ...state }, CONFIGS.BOUND_POSITION_KEYS);
    if (viewState.zoom > CONFIGS.DEFAULT_VIEW_STATE.maxZoom) {
      viewState.zoom = CONFIGS.DEFAULT_VIEW_STATE.maxZoom;
      this.setLayers(this.state)
    }

    this.deck.setProps({ viewState });
    if (params.initial) this.deck.setProps({ initialViewState: viewState });

    this.map.jumpTo({
      center: [ viewState.longitude, viewState.latitude ],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch,
    });

    const bearingIcon = document.querySelector(`#${this.id} .location.arrow.icon`);
    if (bearingIcon) bearingIcon.style['transform'] = `rotate(${viewState.bearing - 45}deg)`;

    if (this.state.tip) {
      this.clearTimeout()
      this.setState({ tip: null })
    }
  }

  setFollow = (f = {}, state = {}) => {
    const follow = (feature) => {
      if (feature && !state.follow[feature.id]) {
        state.follow[feature.id] = feature;
        this.setFollow(feature, state)
      }
    }

    const fu = lodash.find(this.state.data.features, { id: f.properties['follow-up'] });

    if (fu?.geometry?.type === 'Point') {
      follow(fu);
    }

    if (fu?.geometry?.type === 'LineString') {
      const i = fu.geometry.coordinates.findIndex((c) => c.join(',') === f.geometry.coordinates.join(','));
      if (i < 0) follow(fu);
    }

    if (state.selection?.length || state.hovering?.length) {
      if (state.selection?.length === 1 && (lodash.first(state.selection).geometry.type === 'LineString')) {

      } else {
        lodash.each(f.properties['followed-by'], (id) => {
          follow(lodash.find(this.state.data.features, { id }));
        });
      }
    }
  }

  handleDeckClick = (info, event) => {
    const { draw, data } = this.state;

    if (!draw.enable) return;

    if (draw.mode) {
      if (draw.mode === 'transform') {
        this.handleChangeState('draw', {
          mode: null,
          selection: [],
          hovering: [],
          follow: {}
        });
      }

      return;
    }

    if (info.object) {
      if (info.object.properties.editable) {
        const object = {
          ...info.object,
          id: info.object.id,
          section: info.object.properties.editable === 'associated'
            ? 'Associated objects'
            : 'Free objects'
        }

        const state = { selection: [ object ], follow: {} };

        if (lodash.find(draw.selection, object)) {
          state.selection = lodash.filter(draw.selection, (s) => !lodash.isEqual(s, object))
        }

        if (draw.hovering.length) {
          state.selection = [ object ]
          state.hovering = []
          state.follow = {}
        }

        if (draw.multiselect) {
          state.selection = [ ...draw.selection, object ];
        }

        lodash.each(state.selection, (f) => this.setFollow(f, state));

        this.deck.setProps({ getCursor: () => 'grab' });
        this.handleChangeState('draw', state);
      }
    } else {
      if (draw.selection.length) {
        this.handleChangeState('draw', { selection: [], hovering: [], follow: {} });
      }
    }
  }

  handleDeckHover = (info, event) => {
    const { draw, data } = this.state;

    if (['point', 'lineString'].includes(draw.mode)) {
      return this.deck.setProps({ getCursor: () => 'crosshair' })
    }

    if (info.object) {
      const object = {
        ...info.object,
        id: info.object.id,
        section: info.object.properties.editable === 'associated'
          ? 'Associated objects'
          : 'Free objects'
      }

      if (lodash.find(draw.selection, object)) {
        this.deck.setProps({ getCursor: () => 'grab' })
      } else {
        if (info.object.properties.editHandleType === 'existing') {
          this.deck.setProps({ getCursor: () => 'grab' })
        } else {
          this.deck.setProps({ getCursor: () => 'pointer' })
        }

        if (lodash.find(draw.hovering, object)) {
          if (info.object.properties.editable) {
            if (info.object.geometry.type === 'LineString') {
              this.handleHover(info)
            }
          }
        } else {
          if (info.object.id) {
            if (typeof info.object.id === 'string') {
              if (info.object.id.endsWith(':a')) return;
              if (info.object.id.endsWith(':b')) return;
            }

            this.deck.setProps({ getCursor: () => 'pointer' })

            if (draw.mode !== 'transform') {
              if (info.object.properties?.editable) {
                const state = { hovering: [ object ], follow: {} }
                lodash.each(state.hovering, (f) => this.setFollow(f, state));
  
                this.handleChangeState('draw', state);
              }
            }
          }
        }
      }
    } else {
      if (info.viewport) {
        this.clearTimeout();
        this.setState({ tip: null, contextMenu: null });
        this.deck.setProps({ getCursor: () => 'default' })
      }

      if (draw.hovering.length) {
        this.handleChangeState('draw', { hovering: [] });
      }
    }
  }

  handleEdit = async ({ updatedData, editType, editContext }) => {
    if (this.rightButton) return (this.rightButton = null)

    this.clearTimeout();

    const { this: uiObject = {} } = this.context.sandbox.getContext();
    const { draw, data } = this.state;

    const featureIndexes = lodash.filter(editContext.featureIndexes, (i) => data.features[i]?.properties?.editable)

    if (draw.mode === 'point') {
      if (editType === 'addFeature') {
        const coordinates = updatedData.features[lodash.first(editContext.featureIndexes)].geometry.coordinates;

        const oldFeature = null;
        const newFeature = uiObject.addFreePoint(coordinates);

        uiObject.update();

        const [ action ] = this.getEventActions({ type: 'map_draw', alias: 'map_draw' }, {
          action: 'new',
          target: {
            type: 'point',
            oldValue: oldFeature,
            newValue: lodash.cloneDeep(newFeature),
          },
        });

        if (action) {
          if (action.executeScript?.client) {
            const options = await action.executeScript.client();
            await action.executeScript.server(options);
          }
        }
      }
    }

    if (draw.mode === 'lineString') {
      if (editType === 'addFeature') {
        const coordinates = updatedData.features[lodash.first(editContext.featureIndexes)].geometry.coordinates

        const oldFeature = null;
        const newFeature = uiObject.addFreeLine(coordinates)

        uiObject.update();

        this.deck.setProps({ getCursor: () => 'default' });
        this.handleChangeState('draw', { mode: null });

        const [ action ] = this.getEventActions({ type: 'map_draw', alias: 'map_draw' }, {
          action: 'new',
          target: {
            type: 'lineString',
            oldValue: oldFeature,
            newValue: lodash.cloneDeep(newFeature),
          },
        });

        if (action) {
          if (action.executeScript?.client) {
            const options = await action.executeScript.client();
            await action.executeScript.server(options);
          }
        }
      }
    }

    if (editType === 'addPosition') {
      this.lockEdit = true;

      uiObject.setFeatures(updatedData.features);
      uiObject.update();

      await Promise.each(featureIndexes, async (index) => {
        const oldFeature = data.features[index];
        const newFeature = updatedData.features[index];

        const [ action ] = this.getEventActions({ type: 'map_draw', alias: 'map_draw' }, {
          action: 'change',
          target: {
            type: CONFIGS.DRAW_TYPES[newFeature.geometry.type],
            oldValue: lodash.cloneDeep(oldFeature),
            newValue: lodash.cloneDeep(newFeature),
          },
        });

        if (action) {
          if (action.executeScript?.client) {
            const options = await action.executeScript.client();
            await action.executeScript.server(options);
          }
        }
      });

      this.lockEdit = false;
    }

    if (['translating', 'rotating', 'scaling', 'movePosition'].includes(editType)) {
      if (this.lockEdit) return;

      lodash.each(featureIndexes, (i) => {
        const oldFeature = data.features[i];
        const newFeature = updatedData.features[i];

        if (newFeature.geometry.type === 'Point') {
          if (newFeature.id.endsWith(':a')) return;
          if (newFeature.id.endsWith(':b')) return;

          const followUpIndex = lodash.findIndex(data.features, { id: newFeature.properties['follow-up'] });
          const followUpFeature = updatedData.features[followUpIndex];

          if (followUpFeature) {
            if (followUpFeature.geometry.type === 'LineString') {
              if (!this.lineStringPointIndex) {
                const lineStringPointIndex = followUpFeature.geometry.coordinates.findIndex((c) => c.join(',') === (oldFeature?.geometry?.coordinates || []).join(','))
                if (lineStringPointIndex > -1) this.lineStringPointIndex = lineStringPointIndex;
              }
  
              if (!this.endA) {
                const endAIndex = lodash.findIndex(updatedData.features, (f) => f.id.endsWith(`${followUpFeature.id}:a`))
                this.endA = updatedData.features[endAIndex];
              }
  
              if (!this.endB) {
                const endBIndex = lodash.findIndex(updatedData.features, (f) => f.id.endsWith(`${followUpFeature.id}:b`))
                this.endB = updatedData.features[endBIndex];
              }
            }
  
            if (this.lineStringPointIndex > -1) {
              if (this.endA) {
                if (this.lineStringPointIndex === 0) {
                  if (lodash.isEqual(followUpFeature.geometry.coordinates[this.lineStringPointIndex], this.endA.geometry.coordinates)) {
                    this.endA.geometry.coordinates = newFeature.geometry.coordinates;
                  }
                }
                if (this.lineStringPointIndex === (followUpFeature.geometry.coordinates.length - 1)) {
                  if (lodash.isEqual(followUpFeature.geometry.coordinates[this.lineStringPointIndex], this.endA.geometry.coordinates)) {
                    this.endA.geometry.coordinates = newFeature.geometry.coordinates;
                  }
                }
              }
              if (this.endB) {
                if (this.lineStringPointIndex === 0) {
                  if (lodash.isEqual(followUpFeature.geometry.coordinates[this.lineStringPointIndex], this.endB.geometry.coordinates)) {
                    this.endB.geometry.coordinates = newFeature.geometry.coordinates;
                  }
                }
                if (this.lineStringPointIndex === (followUpFeature.geometry.coordinates.length - 1)) {
                  if (lodash.isEqual(followUpFeature.geometry.coordinates[this.lineStringPointIndex], this.endB.geometry.coordinates)) {
                    this.endB.geometry.coordinates = newFeature.geometry.coordinates;
                  }
                }
              }
  
              followUpFeature.geometry.coordinates[this.lineStringPointIndex] = newFeature.geometry.coordinates;
            }
          }
        }

        if (newFeature.geometry.type === 'LineString') {
          if (editType === 'movePosition') {
            lodash.each(editContext.positionIndexes, (index) => {
              if (index === 0) {
                const newAFeatureIndex = lodash.findIndex(updatedData.features, { id: `${newFeature.id}:a` })
                const newAFeature = updatedData.features[newAFeatureIndex];

                if (newAFeature) {
                  if (!lodash.isEqual(newAFeature.geometry.coordinates, newFeature.geometry.coordinates[newFeature.geometry.coordinates.length - 1])) {
                    newAFeature.geometry.coordinates = newFeature.geometry.coordinates[index];
                  }
                }

                const newBFeatureIndex = lodash.findIndex(updatedData.features, { id: `${newFeature.id}:b` })
                const newBFeature = updatedData.features[newBFeatureIndex];

                if (newBFeature) {
                  if (!lodash.isEqual(newBFeature.geometry.coordinates, newFeature.geometry.coordinates[newFeature.geometry.coordinates.length - 1])) {
                    newBFeature.geometry.coordinates = newFeature.geometry.coordinates[index];
                  }
                }
              }

              if (index === (newFeature.geometry.coordinates.length - 1)) {
                const newAFeatureIndex = lodash.findIndex(updatedData.features, { id: `${newFeature.id}:a` })
                const newAFeature = updatedData.features[newAFeatureIndex];

                if (newAFeature) {
                  if (!lodash.isEqual(newAFeature.geometry.coordinates, newFeature.geometry.coordinates[0])) {
                    newAFeature.geometry.coordinates = newFeature.geometry.coordinates[index];
                  }
                }

                const newBFeatureIndex = lodash.findIndex(updatedData.features, { id: `${newFeature.id}:b` })
                const newBFeature = updatedData.features[newBFeatureIndex];

                if (newBFeature) {
                  if (!lodash.isEqual(newBFeature.geometry.coordinates, newFeature.geometry.coordinates[0])) {
                    newBFeature.geometry.coordinates = newFeature.geometry.coordinates[index];
                  }
                }
              }
            })
          }
        }
      })

      this.deck.setProps({ getCursor: () => 'grabbing' });
      uiObject.setFeatures(updatedData.features);
      uiObject.update({ withState: false });
    }

    if (['translated', 'rotated', 'scaled', 'finishMovePosition'].includes(editType)) {
      this.deck.setProps({ getCursor: () => 'grab' });

      await Promise.each(featureIndexes, async (i) => {
        const oldFeature = data.features[i];
        const newFeature = updatedData.features[i];

        if (newFeature.geometry.type === 'Point') {
          const followUpIndex = lodash.findIndex(data.features, { id: newFeature.properties['follow-up'] });

          const oldFollowUpFeature = data.features[followUpIndex];
          const newFollowUpFeature = updatedData.features[followUpIndex];

          if (newFollowUpFeature?.geometry?.type === 'LineString') {
            await this.changeFeature({
              oldValue: lodash.cloneDeep(oldFollowUpFeature),
              newValue: lodash.cloneDeep(newFollowUpFeature),
              type: CONFIGS.DRAW_TYPES[newFollowUpFeature.geometry.type],
            })
          }
        }

        await this.changeFeature({
          oldValue: lodash.cloneDeep(oldFeature),
          newValue: lodash.cloneDeep(newFeature),
          type: CONFIGS.DRAW_TYPES[newFeature.geometry.type],
        })
      });

      uiObject.update();

      this.lineStringPointIndex = null
      this.endA = null
      this.endB = null
    }
  }

  changeFeature = async ({ type, oldValue, newValue }) => {
    const [ action ] = this.getEventActions({ type: 'map_draw', alias: 'map_draw' }, {
      action: 'change',
      target: { type, oldValue, newValue },
    });

    if (action) {
      if (action.executeScript?.client) {
        const options = await action.executeScript.client();
        options && await action.executeScript.server(options);
      }
    }
  }

  handleHover = (info = {}) => {
    if (info.object) {
      if (info.object.properties.cluster_id) {
        this.openTip(info);
        this.deck.setProps({ getCursor: () => 'pointer' });
      } else {
        const actions = {
          map_item: this.getActions({ type: 'map_item' }, info),
          map_item_tip: this.getActions({ type: 'map_item_tip' }, info),
        };
        const geometry = CONFIGS.TARGET_TYPES[info.object.geometry.type];
        const hoverEvent = this.state.events.hover[geometry];
        const clickEvent = this.state.events.click[geometry];

        if ((actions.map_item || actions.map_item_tip)
          || ([hoverEvent, clickEvent].includes('tip') && MAP_VIEW_HELPERS.getTipData(info.object))
          || ([hoverEvent, clickEvent].includes('form') && MAP_VIEW_HELPERS.getFormData(info.object))) {
          this.deck.setProps({ getCursor: () => 'pointer' });
        }

        if (hoverEvent === 'tip') this.openTip(info);
        if (hoverEvent === 'form') this.openForm(info);
        if (hoverEvent === 'no') {
          if (this.state.tip) {
            this.clearTimeout();
            this.setState({ tip: null });
          }
        }
      }
    }
  }

  handleClick = (info = {}, event) => {
    const click = async () => {
      const { x, y, z, object } = info;

      if (object) {
        if (event.rightButton) {
          this.clearTimeout();
          this.setState({ contextMenu: info, tip: null });
        } else {
          const actions = this.getActions({ type: 'map_item' }, info);

          for (let action of actions) {
            let options = {}

            if (action.executeScript?.client) {
              let result = await action.executeScript.client();

              if (typeof result === 'object') {
                if (result.result === true) {
                  options.ui_params = result.ui_params;
                  result = true;
                } else {
                  result = false;
                }
              }

              if (!result) break;
            }

            if (action.executeScript?.server) {
              action.executeScript.server(options);
              break;
            }
          }
        }

        if (object.properties.cluster_id && !object.expanded) {
          if (object.hasOwnProperty('expanded')) {
            this.openTip(info);
          } else {
            const [longitude, latitude] = object.geometry.coordinates;
            this.handleChangeViewState({ zoom: z, latitude, longitude });
            this.setState({ tip: null });
          }
        } else {
          const geometry = CONFIGS.TARGET_TYPES[object.geometry.type];
          const clickEvent = this.state.events.click[geometry];
          if (clickEvent === 'tip') this.openTip(info, 0);
          if (clickEvent === 'form') this.openForm(info, 0);
        }
      } else {
        this.clearTimeout();
        this.setState({ tip: null, contextMenu: null });
      }
    }

    click()
  }

  handleDragStart = (info, event) => {
    const { configs } = this.state;

    this.deck.setProps({ getCursor: () => 'all-scroll' });

    if (configs.zoomArea) {
      const wrapper = document.querySelector(`#${this.id}`);
      const overlay = document.querySelector(`#${this.id} #zoom-area-overlay`);

      overlay.width = wrapper.clientWidth;
      overlay.height = wrapper.clientHeight;
      overlay.ctx = overlay.getContext('2d');
      overlay.ctx.fillStyle = 'grey';
      overlay.ctx.globalAlpha = 0.3;

      this.startX = info.x;
      this.startY = info.y;

      this.deck.setProps({ controller: { dragPan: false } });
    }

    if (info.coordinate) this.dragPositionStart = info.coordinate;
  }

  handleDragEnd = async (info, event) => {
    const { configs } = this.state;

    if (configs.zoomArea) {
      const bounds = [ this.dragPositionStart, this.dragPositionEnd ];
      const overlay = document.querySelector(`#${this.id} #zoom-area-overlay`);
      const viewState = MAP_VIEW_HELPERS.getViewStateByBounds(bounds, configs);

      overlay.ctx = overlay.getContext('2d');
      overlay.ctx.clearRect(0, 0, overlay.width, overlay.height);

      this.deck.setProps({ controller: { dragPan: true }, viewState });
      this.handleChangeState('configs', { zoomArea: false });
    }

    if (this.dragPositionStart) delete this.dragPositionStart;
    if (this.dragPositionEnd) delete this.dragPositionEnd;
  }

  handleDrag = (info, event) => {
    const { configs } = this.state;

    if (configs.zoomArea) {
      const overlay = document.querySelector(`#${this.id} #zoom-area-overlay`);

      overlay.ctx = overlay.getContext('2d');
      overlay.ctx.clearRect(0, 0, overlay.width, overlay.height);
      overlay.ctx.fillRect(this.startX, this.startY, info.x - this.startX, info.y - this.startY);

      if (info.coordinate) this.dragPositionEnd = info.coordinate;
    }
  }

  handleClickLegendItem = (item) => {
    const features = item.geometry
      ? lodash.filter(this.state.data.features, { id: item.id })
      : item.groups
        ? lodash.filter(this.state.data.features, (f) => (f.properties.section === item.id))
        : lodash.filter(this.state.data.features, (f) => (f.properties.section === item.section) && (f.properties.group === item.id));

    this.handleChangeViewState(MAP_VIEW_HELPERS.getViewStateByFeatures(features, this.state.configs));
  }

  handleDrawSelectionDelete = async (selection = []) => {
    const confirmationMessage = selection.length === 1
      ? i18n.t('map_draw_selection_delete')
      : i18n.t('map_draw_selection_delete_length', { length: selection.length });

    if (confirm(confirmationMessage)) {
      const { this: uiObject = {} } = this.context.sandbox.getContext();

      await Promise.each(selection, async (object) => {
        const feature = uiObject.getFeature(object);

        uiObject.removeFeature(object);
        uiObject.update();

        const [ action ] = this.getEventActions({ type: 'map_draw', alias: 'map_draw' }, {
          action: 'delete',
          target: { type: CONFIGS.DRAW_TYPES[feature.geometry.type], newValue: feature },
        });

        if (action) {
          if (action.executeScript?.client) {
            const options = await action.executeScript.client();
            options && await action.executeScript.server(options);
          }
        }
      });

      this.handleChangeState('draw', { selection: [] });
    }
  }

  openTip = (info = {}, timeout = CONFIGS.DEFAULT_EVENT_TIMEOUT) => {
    const { x, y, object, coordinate } = info;
    const data = MAP_VIEW_HELPERS.getTipData(object);

    if (data) {
      this.clearTimeout();
      this.timeout = setTimeout(() => {
        if (this.state.contextMenu) return;
        this.setState({ tip: { data, x: x + 1, y, coordinate } })
      }, timeout);
    }
  }

  openForm = (info, timeout = CONFIGS.DEFAULT_EVENT_TIMEOUT) => {
    const { x, y, object, coordinate } = info;
    const data = MAP_VIEW_HELPERS.getFormData(object);

    if (data && data.model && data.record) {
      this.clearTimeout();
      this.timeout = setTimeout(() => {
        if (this.state.contextMenu) return;
        this.setState({ form: data });
      }, timeout);
    }
  }

  renderTip = () => {
    if (this.state.tip) {
      const { props = {}, callbacks = {} } = this.props;
      const { handleAction } = callbacks;
      const { model, context } = props;

      const actions = this.getActions({ type: 'map_item_tip' }, this.state.tip, { available: true });

      return (
        <Tip
          {...this.state.tip}
          model={model}
          actions={actions}
          context={context}
          handleAction={handleAction}
        />
      );
    }
  }

  renderContextMenu = () => {
    if (this.state.contextMenu) {
      const actions = this.getActions({ type: 'map_item_context' }, this.state.contextMenu)
      const callbacks = { handleAction: () => this.setState({ contextMenu: null }) }

      return (
        <ContextMenu
          x={this.state.contextMenu.x}
          y={this.state.contextMenu.y}
          actions={actions}
          callbacks={callbacks}
        />
      );
    }
  }

  renderModal = () => {
    if (this.state.form) {
      return (
        <FormModal
          parent={{ type: 'view', vtype: 'map', alias: this.props.props.view.alias, id: this.props.props.view.id }}
          modelAlias={(HELPERS.getModel(this.state.form.model) || {}).alias}
          recordId={this.state.form.record}
          onClose={() => this.setState({ form: null })}
          opened={true}
          fullMode={true}
        />
      );
    }
  }

  renderProgress = () => {
    return (
      <Progress id={`view-data-loading-progress-${this.props.props.view.id}`}/>
    );
  }

  renderLegend = () => {
    return (
      <Legend
        map={this.map}
        data={this.state.data}
        draw={this.state.draw}
        legend={this.state.legend}
        configs={this.state.configs}
        onChange={this.handleChangeState}
        onClickItem={this.handleClickLegendItem}
      />
    );
  }

  renderNavigationControl = () => {
    return (
      <Controls.NavigationControl
        configs={this.state.configs}
        actions={{
          onZoomIn: () => this.handleChangeViewState({ zoom: this.deck.props.viewState.zoom + 0.5 }),
          onZoomOut: () => this.handleChangeViewState({ zoom: this.deck.props.viewState.zoom - 0.5 }),
          onBearing: () => this.handleChangeViewState({ bearing: 0, pitch: 0 }),
        }}
      />
    );
  }

  renderConfigsControl = () => {
    return (
      <Controls.ConfigsControl
        draw={this.state.draw}
        configs={this.state.configs}
        actions={{
          onHomeClick: () => this.handleChangeViewState(this.deck.props.initialViewState),
          onSourceClick: (source) => this.handleChangeState('configs', { source }),
          onToggleClick: () => this.handleChangeState('configs', { legendShow: !this.state.configs.legendShow }),
          onFullScreenClick: () => {
            const map = document.querySelector(`#${this.id}`);

            if (!this.state.configs.fullScreen) {
              map.style.position = 'fixed';
              map.style.top = '0px';
              map.style.left = '0px';
              map.style['z-index'] = 10000;
              map.style.width = '100%';
            } else {
              map.style.removeProperty('position');
              map.style.removeProperty('top');
              map.style.removeProperty('left');
              map.style.removeProperty('z-index');
              map.style.removeProperty('width');
            }

            const content = document.querySelector(`#${this.id} .view-map-content`);

            if (!this.state.configs.fullScreen) {
              content.style.height = `${content.parentElement.clientHeight}px`;
            } else {
              content.style.removeProperty('height');
            }

            this.handleChangeState('configs', {
              fullScreen: !this.state.configs.fullScreen,
              contentWidth: content.parentElement.clientWidth - this.state.configs.legendWidth,
              contentHeight: content.parentElement.clientHeight,
            });
          },
          onZoomAreaClick: () => {
            this.handleChangeState('configs', { zoomArea: true })
            this.handleChangeState('draw', { mode: null, selection: [] })
          },
          onDrawModeChange: (mode) => {
            const configs = { zoomArea: false }
            const draw = { mode }

            if (['point', 'lineString'].includes(draw.mode)) {
              draw.selection = []
            }

            this.handleChangeState('configs', configs)
            this.handleChangeState('draw', draw)
          },
          onDeleteSelectedClick: this.handleDrawSelectionDelete,
        }}
      />
    );
  }

  renderControls = () => {
    return (
      <div className="view-map-controls">
        {this.renderNavigationControl()}
        {this.renderConfigsControl()}
      </div>
    );
  }

  renderContent = () => {
    const styles = {
      map: {
        position: 'absolute',
        height: '100%',
        width: '100%',
      },
      zoomAreaOverlay: {
        position: 'absolute',
        pointerEvents: 'none',
      },
    };

    return (
      <div className="view-map-content">
        <div id={this.idMap} style={styles.map} />
        <canvas id={this.idCanvas} />
        <canvas id="zoom-area-overlay" style={styles.zoomAreaOverlay} />
        {this.renderContextMenu()}
        {this.renderTip()}
      </div>
    );
  }

  render() {
    const styles = this.getStyles(this.state.configs);

    return (
      <ViewMapStyled id={this.id} className="view-map" styles={styles}>
        {this.renderLegend()}
        {this.renderContent()}
        {this.renderControls()}
        {this.renderProgress()}
        {this.renderModal()}

        {this.props.children}
      </ViewMapStyled>
    );
  }
}
