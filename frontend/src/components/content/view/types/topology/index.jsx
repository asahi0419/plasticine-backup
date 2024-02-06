import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge, keys, values } from 'lodash/object';
import { isUndefined, isObject, isNumber, isEmpty } from 'lodash/lang';
import { map, filter, orderBy } from 'lodash/collection';

import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import popper from 'cytoscape-popper';
import { default as tippy } from 'tippy.js';

import COSEBilkent from 'cytoscape-cose-bilkent';
import dagre from 'cytoscape-dagre';

import FormModal from '../../../../shared/form-modal';
import ContextMenu from './context-menu';

import * as HELPERS from '../../../../../helpers';
import * as TOPOLOGY_HELPERS from './helpers';
import Sandbox from '../../../../../sandbox/index.js'
import Loader from '../../../../shared/loader';
import PlasticineApi from '../../../../../api';
import { processError } from '../../../../../actions/helpers';

Cytoscape.use(dagre);
Cytoscape.use(popper);

const EDGE_STYLES = {
  rounded_elbow: 'multi-unbundled-bezier-up',//'bezier',
  square_elbow: 'taxi',
  straight: 'straight'
};

const EDGE_ARROWS = {
  'no': 'none',
  'arrow': 'triangle'
};

const WEB_SERVICE_ALIAS = 'update_topology_data';

const NODE_SHAPES = {
  'diamond': 'diamond',
  'round-diamond': 'round-diamond',
  'ellipse': 'ellipse',
  'hexagon': 'hexagon',
  'round-hexagon': 'round-hexagon',
  'octagon': 'octagon',
  'round-octagon': 'round-octagon',
  'rectangle': 'rectangle',
  'round-rectangle': 'round-rectangle',
  'bottom-round-rectangle': 'bottom-round-rectangle',
  'cut-rectangle': 'cut-rectangle',
  'triangle': 'triangle',
  'round-triangle': 'round-triangle',
  'vee': 'vee',
  'barrel': 'barrel',
  'rhomboid': 'rhomboid',
  'pentagon': 'pentagon',
  'round-pentagon': 'round-pentagon',
  'concave-hexagon': 'concave-hexagon',
  'heptagon': 'heptagon',
  'round-heptagon': 'round-heptagon',
  'star': 'star',
  'tag': 'tag',
  'round-tag': 'round-tag',
  'polygon': 'polygon' // need shape-polygon-points settings, now not realized
};

export default class ViewTopology extends Component {
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
    }),
  };

  static contextTypes = {
    getCache: PropTypes.func,
    setCache: PropTypes.func,
    sandbox: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      form: null,
      contextMenu: null,
      contextActions: null,
    };

    this.mainParams = {};
    this.coordinates = {id: null, data: {}};
  }

  componentWillMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    return this.setContent(nextProps);
  }

  setContent = (props) => {
    const { viewOptions = {} } = props.props;
    const { coordinates = {} } = viewOptions;
    if (coordinates.id) {
      this.coordinates = {
        id: coordinates.id,
        data: JSON.parse(coordinates.data)
      };
    }
  }

  getActions = (attributes = {}, target = {}) => {
    const context = { modelId: this.props.props.model.id };
    const sandbox = new Sandbox ({
      user: this.context.sandbox.context.user,
      uiObject: {
        attributes: {
          ...target,
          __type: 'topology',
          graph: this.props.props.viewOptions.appearance[0].data.graph
        },
        parent: (this.context.sandbox.getContext() || {}).this,
      },
    });
    const actions = filter(this.props.props.actions, attributes);
    const actionsAvailable = filter(actions, (a = {}) => a.group || sandbox.executeScript(a.condition_script, context, `action/${a.id}/condition_script`));
    const actionsOrdered = orderBy(actionsAvailable, ['position'], ['desc']);
    return map(actionsOrdered, (a = {}) => {                                                                                                                                                                                                                                                                                                                                                                         
      const result = { ...a, executeScript: {} };
      result.executeScript.client = () => sandbox.executeScript(a.client_script, context, `action/${a.id}/client_script`);
      return result;
    });
  }

  openForm = (event) => {
    const data = TOPOLOGY_HELPERS.getFormData(event);
    if (data) {
      this.setState({ form: data });
    }
  }

  handleRightClick = (event) => {
    const actions = this.getActions({type: 'topology_item_context'}, event);
    if (!lodash.isEmpty(actions)) {
      this.setState({ contextMenu: event, contextActions: actions });
    }
  }

  handleLeftClick = (event) => {
    const actions = this.getActions({type: 'topology_item'}, event);

    if (actions.length) return actions[0].executeScript.client();
    return this.openForm(event);
  }

  renderContextMenu = () => {
    if (this.state.contextMenu) {
      const callbacks = { handleAction: () => this.setState({ contextMenu: null }) }

      return (
        <ContextMenu
          x={this.state.contextMenu.originalEvent.layerX}
          y={this.state.contextMenu.originalEvent.layerY}
          actions={this.state.contextActions}
          callbacks={callbacks}
        />
      );
    }
  }

  renderModal = () => {
    if (this.state.form) {
      const form = this.state.form;
      return (
        <FormModal
          modelAlias={(HELPERS.getModel(form.model) || {}).alias}
          recordId={form.record}
          onClose={() => this.setState({ form: null })}
          opened={true}
          fullMode={false}
        />
      );
    }
  }

  render() {
    if (!this.props.ready) return <Loader />;

    const { viewOptions = {} } = this.props.props;
    const { appearance = [] } = viewOptions;
    if (!appearance[0]) { return null; }

    const { data = {} } = appearance[0];
    const { graph = {} } = data;

    const { properties = {} } = graph;
    const { edges_shape = 'rounded_elbow', padding_min = 20 } = properties;
    const edgeStyle = EDGE_STYLES[edges_shape] || 'rounded_elbow';
    let layout;

    const topologyDataId = this.coordinates.id;
    const topologyType = 'tree'; // need get from appearance
    if (topologyDataId) {
      layout = {
        name: 'preset'
      }
    } else if (topologyType == 'tree') {
      layout = { 
        name: 'dagre',
        rankDir: 'LR',
        nodeDimensionsIncludeLabels: true,
        spacingFactor: Math.floor(padding_min / 20)
      };
    }
    // else if () {
      // layout = { name: 'cose-bilkent'};
    // }

    let stylesheet = [{
      selector: "node",
      style: {
        label: 'data(label)',
        'background-fit': 'cover',
        'background-color': '#ffffff'
      }
    },{
      selector: "edge",
      style: {
        label: 'data(label)'
      }
    },{
      selector: "edge.straight",
      style: {
        "curve-style": "straight",
        // "edge-text-rotation": "autorotate",
      }
    },{
      selector: "edge.taxi",
      style: {
        "curve-style": "taxi",
        "taxi-direction": "horizontal",
        "taxi-turn": 20,
        "taxi-turn-min-distance": 5,
      }
    },{
      selector: 'edge.bezier',
      style: {
        'curve-style': 'bezier',
      }
    },{
      selector: 'edge.multi-unbundled-bezier-up',
      style: {
        'curve-style': 'unbundled-bezier',
        'control-point-distances': [10, -20],
        'control-point-weights': [0.250, 0.75],
      }
    },{
      selector: 'edge.multi-unbundled-bezier-down',
      style: {
        'curve-style': 'unbundled-bezier',
        "control-point-distances": [-10, 20],
        "control-point-weights": [0.250, 0.75],
      }
    }];

    let elements = this.processNodes(graph.nodes, stylesheet);
    const nodeIds = elements.map(({ data }) => data.id);
    elements = elements.concat(this.processEdges(graph.edges, nodeIds, edgeStyle, stylesheet));

    const addQTip = (event) => {
      let element = event.target;
      let data = element.data();

      if (isEmpty(data.linkToRecord)) return;

      let ref = element.popperRef();
      
      element.tippy = new tippy(document.createElement('div'), {
        getReferenceClientRect: ref.getBoundingClientRect,
        trigger: 'manual',
        allowHTML: true,
        content: `<a href='${data.linkToRecord}' target='_blank'>Open record</a>`,
        interactive: true,
        appendTo: document.body,
        onHidden(instance) {
          instance.destroy();
        }
      });

      element.tippy.show();
      element.on('mouseout', () => {
        element.tippy.hideWithInteractivity('mouseout');
      });
    };

    return (
    <>
      <CytoscapeComponent cy={(cy) => { 
        
        cy.removeAllListeners();
        
        cy.on('mouseover', 'node', (event) => {
          addQTip(event);
        });

        cy.on('mouseover', 'edge', (event) => {
          addQTip(event);
        });

        cy.on('mouseout', 'node', () => {
          this.setState({ contextMenu: null });
        });

        cy.on('mouseout', 'edge', () => {
          this.setState({ contextMenu: null });
        });

        cy.on('click', 'node', (event) => {
          this.handleLeftClick(event);
        });

        cy.on('click', 'edge', (event) => {
          this.handleLeftClick(event);
        });

        cy.on('cxttap', 'node', (event) => {
          this.handleRightClick(event)
        });

        cy.on('cxttap', 'edge', (event) => {
          this.handleRightClick(event)
        });

        cy.on('free', 'node', async (event) => {
          if (this.needToSave(event)) {
            this.mainParams.saveNodes = cy.elements('node');
            await this.saveCoordinates();
          }
        });
      }}
      elements={elements}
      layout={layout}
      stylesheet={stylesheet}
      style={{
        width: 'inherit',
        height: '600px',
        margin: '5px'
      }}
      />
      {this.renderContextMenu()}
      {this.renderModal()}  
    </>
    );
  }

  roundTo2(num) {
    return Number(num.toFixed(2));
  }

  needToSave(event) {
    const processedNode = this.mainParams.processedNode;
    const { data: { id }, position: { x, y } } = event.target._private

    if (isEmpty(processedNode) || processedNode.id != id || processedNode.x != x || processedNode.y != y) {
      this.mainParams.processedNode = { id, x, y };
      return true;
    }
    return false;
  }

  async saveCoordinates() {
    if (this.mainParams.savingCoordinates) return;
    this.mainParams.savingCoordinates = true; // this need to exclude second creation of record

    let attr = {
      data: {}
    };
    const nodes = this.mainParams.saveNodes;
    this.mainParams.saveNodes = null;

    for (let node of nodes) {
      const targetData = node._private;
      const coordX = this.roundTo2(targetData.position.x);
      const coordY = this.roundTo2(targetData.position.y);
      attr.data[targetData.data.id] = [coordX, coordY];
    }

    const topologyDataId = this.coordinates.id;
    if (topologyDataId) {
      await this.updateRecord(attr, topologyDataId);
    } else {
      const { viewOptions = {}, view = {} } = this.props.props;

      if (this.props.props.context === 'main_view') {
        attr.view_id = view.id;
      } else { // embedded
        attr.model_id = viewOptions.embedded_to.model_id;
        attr.record_id = viewOptions.embedded_to.record_id;
        attr.appearance_id = view.appearance;
      }

      const createdRec = await this.createRecord(attr);
      this.coordinates = {id: createdRec.id, data: attr.data};
    }

    const { context = 'view' } = this.props.props;
    if (context == 'embedded_view') {
      this.props.clearCache();
    }

    this.mainParams.savingCoordinates = false;
    if (!isEmpty(this.mainParams.saveNodes)) {
      this.saveCoordinates();
    }
  }

  async createRecord(attributes) {
    try {
      const result = await PlasticineApi.invokeWebService(WEB_SERVICE_ALIAS, {
        attributes: JSON.stringify(attributes)
      });
      const { data = {} } = result;

      if (data.id) return data;
    } catch (error) {
      processError(error);
    }
  }

  async updateRecord(attributes, topologyDataId) {
    try {
      const result = await PlasticineApi.invokeWebService(WEB_SERVICE_ALIAS, {
        topologyDataId,
        attributes: JSON.stringify(attributes)
      });
    } catch (error) {
      processError(error);
    }
  }

  processNodes(nodes = [], stylesheet) {
    let nodeArray = [];
    for (let node in nodes) {
      nodeArray.push(this.processNode(nodes[node], stylesheet));
    }

    return nodeArray;
  }

  processNode(node, stylesheet) {
    const { properties = {}, ref = '' } = node;
    const { text = {}, icon = {}, padding_min = '10px' } = properties;
    const { label = node.id, position = 'top', size = 10, color = '#606060' } = text;
    let { align = 'center' } = text;
    if (align === 'centered') { align = 'center'; }
    const { type = 'fa', source = 'home', color: color_icon = '#416793', border = {} } = icon;
    const { color: borderColor = '#416793', transparency = 0, width: borderWidth = 2 } = border;
    const borderShape = NODE_SHAPES[border.shape] || 'ellipse';

    let { height, width } = icon;

    if (isUndefined(height) && isUndefined(width)) {
      height = 64;
      width = 64;
    }

    if (isUndefined(height)) { height = width; }
    if (isUndefined(width)) { width = height; }

    let nodeClass = node.id;

    stylesheet.push({
      selector: `node.${nodeClass}`,
      style: {
        'background-image': type === 'fa' ? this.getIcon(source) : source,
        'text-halign': align,
        'text-valign': position,
        'font-size': size,
        color,
        height,
        width,
        // padding: padding_min,
        shape: borderShape,
        'border-color': borderColor,
        'border-opacity': transparency/255,
        'border-width': borderWidth,
      }
    });

    let result = {
      classes: nodeClass,
      data: {
        id: node.id,
        label,
        linkToRecord: this.getLink(ref),
      }
    };
    const savedCoords = this.coordinates.data && this.coordinates.data[node.id];
    if (savedCoords) {
      result.position = {x: savedCoords[0], y: savedCoords[1]}
    }
    return result;
  }

  getLink(ref) {
    if (!isObject(ref)) return '';

    const [ model ] = keys(ref);
    const [ record ] = values(ref);

    if (!isNumber(+model) || !isNumber(+record)) return '';

    const modelAlias = (HELPERS.getModel(+model) || {}).alias;
    return `/${modelAlias}/form/${record}`;
  }

  getIcon(icon) {
    // return HELPERS.getIcon('font-awesome', 'utf', icon);
    return HELPERS.getIcon('font-awesome', 'svg', icon);
  }

  processEdges(edges = [], nodeIds = [], edgeStyle, stylesheet) {
    let edgesArray = [];

    for (let edge in edges) {
      const { properties = {} } = edges[edge];
      if (this.nodeExist(nodeIds, properties)) {
        edgesArray.push(this.processEdge(edges[edge], edgeStyle, stylesheet));
      }
    }

    return edgesArray;
  }

  nodeExist(nodeIds, properties) {
    return nodeIds.find(n => n === properties.source) &&
      nodeIds.find(n => n === properties.target);
  }

  processEdge(edge, edgeStyle, stylesheet) {
    const { properties = {}, ref = '' } = edge;
    const { text = {}, source, target, width = 2, line_start = 'no', line_end = 'no', color: lineColor = '#606060' } = properties;
    const { label, position = 'top', size = 10, color = '#606060' } = text;
    const edgeClass = edge.id;
    
    let { align = 'centered' } = text;
    let textProps = {};

    if (label) {
      textProps = {
        'text-margin-y': position == 'top' ? '-10' : '10',
        'font-size': size,
        color
      };
      if (align != 'centered') {
        textProps['text-margin-x'] = align == 'right' ? '20' : '-20';
      }
    }

    stylesheet.push({
      selector: `edge.${edgeClass}`,
      style: merge(textProps, {
        width,
        'line-color': lineColor,
        'source-arrow-color': lineColor,
        'target-arrow-color': lineColor,
        'source-arrow-shape': EDGE_ARROWS[line_start],
        'target-arrow-shape': EDGE_ARROWS[line_end],
      })
    });

    return {
      classes: `${edgeStyle} ${edgeClass}`,
      data: {
        id: edge.id,
        source,
        target,
        label,
        linkToRecord: this.getLink(ref),
      }
    };
  }
}
