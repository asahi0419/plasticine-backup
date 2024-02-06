import React, { Component } from "react";
import { jsPlumb } from "jsplumb";
import PropTypes from 'prop-types';
import { makeUniqueID } from "../../../helpers";
import styled from "styled-components";
import { elementType, sortIndexRoot, splitRoot, getEndElement, setEndColor, clearEndColor, getElementForDrawing, linkType, initInstance, drawLink, addEndpointElement, anchorPoint, alertConnectedEvent, getLinksData, getHiddenData, getParentData, getParentDataColor } from "./helpers";
import * as CONFIGS from './configs';
import Legend from './legend';
import * as Controls from './controls';
import { condition } from "../filter/query-generator/expression-generators/types";
import { cond } from "lodash";
import { isEmpty } from 'lodash/lang';



const StyledContainer = styled.div`
  display: flex;
  position: relative;
  width: 90%; 
  .rootContent {
    margin-bottom: 10px;
    width: 90%; 

  }

  .diagramContainer {
    padding: 20px, 20px, 20px, 20px;
    height: 500px;
    border: 1px solid #d9d9d9;
    resize: both;
    overflow: auto;
    position: relative;
  }

  .diagramDisabled {
    background: #f2f2f2;
    .jtk-endpoint {
      cursor: unset;
    }
    .tubeTextContent{
      cursor: unset;
    }
    .jtk-connector {
      cursor: unset;
    }
  }
  
  .diagramContainerItem {
    padding-top: 20px; 
    display: flex;
    justify-content: space-around;
    width: 90%; 
  }

  .diagramContainerSide {
    display: flex;
    min-width: 100px;
  }

  .cabelContent {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    text-align: center;
    border: 1px solid #c3c3c3;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    font-size: 8px;
    color: #808080;
    background: #E1E1E1;
  }

  .tubeContent {
    display: flex;
  }

  .tubeTextContent {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    text-align: center;
    border: 1px solid #c3c3c3;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 0px;
    cursor: pointer;
    user-select: none;
    font-size: 8px;
    color: #808080;
    background: #E1E1E1;
  }

  .itemCore {
    height: 30px;
    width: 30px;
    border-radius: 100px;
    text-align: center;
    margin: 10px 5px;
    border: 1px solid #c3c3c3;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: absolute;
    z-index: 50;
    font-size: 8px;
    color: #808080;
    background: #E1E1E1;
  }

  .itemPort {
    height: 26px;
    width: 26px;
    border-radius: 3px;
    text-align: center;
    margin: 10px 5px;
    border: 1px solid #c3c3c3;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: absolute;
    z-index: 50;
    font-size: 8px;
    color: #808080;
    background: #E1E1E1;
  }

  .emptyElement {
    min-width: 100px;
  }

  .itemParent {
    position: relative;
    width: 40px;
    height: 50px;
  }

  .showNone {
    display: none!important;
  }

  .hiddenLinkCoreBox {
    display: flex;
    align-items: center;
    height: 50px;
    p {
      width: 100px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      direction: rtl;
      opacity: 0.7; 
      position: absolute; 
      text-align: left; 
    }
    p:hover {
      opacity: 1; 
      text-overflow: clip; 
      width: 300px; 
      text-align: left; 
    }
  }

  .hiddenLinkPortBox {
    display: flex;
    align-items: center;
    height: 50px;
    p {
      width: 100px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      opacity: 0.7; 
      direction: ltr;
      text-align: right; 
      position: absolute;
    }
    p:hover {
      opacity: 1; 
      text-overflow: clip; 
      text-align: right; 
      width: 300px; 
    }
  }
`;
export default class ConnectionEditor extends Component {
  static propTypes = {
    value: PropTypes.string,
    label: PropTypes.object,
    onChange: PropTypes.func,
    removed_value: PropTypes.string, 
  }

  constructor(props) {
    super(props);
    this.id = `connection-${makeUniqueID()}`;
    this.container = React.createRef();
    const conData = JSON.parse(this.props.value);
    this.state = {
      width: "", 
      height: "", 
      instance: null, 
      endpoint: {}, 
      origin_data: conData, 
      graph: conData.graph, 
      links: conData.links, 
      data: CONFIGS.DEFAULT_DATA,
      events: CONFIGS.DEFAULT_EVENTS,
      configs: CONFIGS.DEFAULT_CONFIGS,
      viewState: CONFIGS.DEFAULT_VIEW_STATE,
      legend: CONFIGS.DEFAULT_LEGEND,
      draw: CONFIGS.DEFAULT_DRAW,
      finaldata: [], 
      contextMenu: null,
      progress: null,
      form: null,
      tip: null,
      sorted_result: false, 
      zoomState: false, 
    };
    
      this.map={};
  }

  componentWillReceiveProps(nextProps) {
    const nextState = {};
    const conData = JSON.parse(nextProps.value);
    if (conData.links !== this.state.links) nextState.links = conData.links;
    if (!isEmpty(nextState)) this.setState(nextState);
  }

  componentDidUpdate() {
    const _this = this;
    const rootElement = [];
    let endpoint = {};
    const conData = JSON.parse(_this.props.value);
    const fieldId = _this.props.fieldId;
    const { onChange } = this.props;
    //Get Root Element
    conData.graph.forEach((data) => {
      if (data.type == elementType.ROOT && (data.collapsed !== "true" && data.collapsed !== true)) {
        rootElement.push(data);
      }
    });
    this.state.instance.deleteEveryEndpoint();

    // conData.graph.forEach((data) => {
    //   if (data.type == elementType.ROOT) {
    //     rootElement.push(data);
    //   }
    // });

    
    // Get End Element
    const endElement = getEndElement(rootElement, conData);
    // Add Endpoint To End Element
    const hiddenData = getHiddenData(conData);
    const disabled = this.props.disabled;
    endpoint = addEndpointElement(hiddenData, this.state.links, this.state.instance, endElement.left, endpoint, fieldId, anchorPoint.LEFT, disabled);
    endpoint = addEndpointElement(hiddenData, this.state.links, this.state.instance, endElement.right, endpoint, fieldId, anchorPoint.RIGHT, disabled);

    // Draw Link with Links Of JSON Data
    const conns = drawLink(this.state.instance, conData, this.state.links, endpoint, fieldId)
    // Make Overshadow To End Element
    Object.keys(endpoint).forEach((index)=>{
      
      let color = linkType.DEFAULT_COLOR;
      conData.graph.forEach((element) => {
        if (`${element.id}-${fieldId}` == index && element.color != undefined) {
          color = element.color;
        } 
      });
      endpoint[index].bind("mouseover", (endpoint)=> {
        setEndColor(endpoint.elementId, color, disabled);
      })
      endpoint[index].bind("mouseout", (endpoint)=> {
        clearEndColor(endpoint.elementId)
      })
    }) 
    
    conns.forEach((connection)=> {
      connection.bind("click", function(conn) {
        if(!disabled) {
          const isConfirmed = confirm(i18n.t('connection_will_be_deleted', { defaultValue: 'Connection will be deleted. Are you sure?'}));
          if(isConfirmed){
            let sourceId = conn.sourceId.replace(`-${fieldId}`,"")
            let targetId = conn.targetId.replace(`-${fieldId}`,"")
            let links = _this.state.links;
            links = links.filter(link => link.from != sourceId && link.to != targetId)
            _this.state.instance.deleteConnection(conns[0]);
            _this.setState({graph: conData.graph}); 
            conData.links = links;

            const newConData = JSON.stringify(conData)
            if (onChange){
              onChange(null, { value: newConData });
            } 
          }
        }
      });
    })

    this.state.instance.bind("connection", function(info, originalEvent) {
      let sourceId = info.sourceId.replace(`-${fieldId}`,"")
      let targetId = info.targetId.replace(`-${fieldId}`,"")
      const links = _this.state.links;
      let includeFlag = links.some(link => link.from == sourceId || link.to == targetId || link.to == sourceId || link.from == targetId );
      if(!includeFlag){
        links.push({from: sourceId, to: targetId});
        // links = [{from: sourceId, to: targetId}, ..._this.state.links];
        // _this.setState({links: links})
        const conData1 = JSON.parse(_this.props.value);
        conData.graph = conData1.graph;         
        const conData_res = conData;
        conData_res.links = links;
        const newConData = JSON.stringify(conData_res);
        if (onChange){
          onChange(null, { value: newConData });
        } 
      }
    });
    
    // alertConnectedEvent(disabled);
  }

  componentDidMount() {
    const _this = this;
    // Create Instance Of JsPlumb
    const instance = jsPlumb.getInstance({
      EndpointStyle: { fill: initInstance.ENDPOINTFILL },
      Anchor: initInstance.ANCHOR,
      Container: this.container.current
    });
    
    this.setState({instance: instance})

    // Get Event Of Element Resize
    const element = this.container.current;
    const width = this.container.current.clientWidth;
    this.setState({width: width + 'px'});
    element.addEventListener('resize', (event) => {
      this.setState({width: event.detail.width + 'px'});
      this.setState({height: event.detail.height + 'px'});
    });

    function checkResize(mutations) {
      const el = mutations[0].target;
      const w = el.clientWidth;
      const h = el.clientHeight;

      const isChange = mutations
          .map((m) => `${m.oldValue}`)
          .some((prev) => prev.indexOf(`width: ${w}px`) === -1 || prev.indexOf(`height: ${h}px`) === -1);

      if (!isChange) { return; }
      const event = new CustomEvent('resize', { detail: { width: w, height: h } });
      el.dispatchEvent(event);
    }

    const observer = new MutationObserver(checkResize);
    observer.observe(element, { attributes: true, attributeOldValue: true, attributeFilter: ['style'] });
    
    // Get Event Of Windows Resize
    var body = _this.container.current;
    var width1 = body.offsetWidth;
    
    if (window.addEventListener) {  // all browsers except IE before version 9
      window.addEventListener ("resize", onResizeEvent, true);
    } else {
      if (window.attachEvent) {   // IE before version 9
        window.attachEvent("onresize", onResizeEvent);
      }
    }

    function onResizeEvent() {
      const bodyElement = _this.container.current;
      const newWidth = bodyElement.offsetWidth;
      if(newWidth != width1){
        width1 = newWidth;
        _this.setState({width: width1 + 'px'});
      }
    }

  }

  renderConnect = (mode = 'cable', id) => {
    const conData = JSON.parse(this.props.value);
    const fieldId = this.props.fieldId;
    const {rootElement, midElement, endElement, direction} = getElementForDrawing(conData, id);
    const {fromLinks, toLinks} = getLinksData(this.state.links);
    const hiddenData = getHiddenData(conData);
    const parentData = getParentData(conData); 
    const parentDataColor = getParentDataColor(conData); 
    var data = conData.graph; 
    var hint_from = [], hint_to = []; 
    
    for (var j = 0; j < data.length; j++) {
      for (var k = 0; k < fromLinks.length; k++) {
        if (data[j].id == fromLinks[k]) {
          hint_from.push(data[j].name);    
        }
        else if (data[j].id == toLinks[k]) {
          hint_to.push(data[j].name); 
        }
      }
    }
    return (
      <div>
        <div className="diagramContainerSide" style={{ direction: direction }}>
          <div
            className="tubeTextContent"
            style={{
              background: rootElement.color,
              color: rootElement.textColor,
              fontSize: rootElement.fontSize
            }}
          >
            {rootElement.name}
          </div>
          <div>
            {midElement.length !== 0
              ? midElement.map((data) => (
                  <div className="tubeContent" key={data.id}>
                    <div
                      className="tubeTextContent"
                      style={{
                        background: data.color,
                        color: data.textColor,
                        fontSize: data.fontSize
                      }}
                    >
                      {data.name}
                    </div>
                    <div>
                      {endElement.map((coreData, index) => (
                        <div key={coreData.id} style={{display: 'flex'}}>
                          <div className={coreData.parent === data.id ? "itemParent" : "showNone"}>
                            {coreData.parent === data.id ? (
                                <div id={`${coreData.id}-${fieldId}`}
                                    className={
                                      mode == "port" ? "itemPort" : "itemCore"
                                    }
                                    style={{
                                      background: coreData.color,
                                      fontSize: coreData.fontSize,
                                      color: coreData.textColor,
                                    }}>
                                  {coreData.name}
                                </div>
                            ) : (
                              <></>
                            )}
                          </div>
                          <div className={coreData.parent === data.id ? rootElement.positionType == 'left' ? "hiddenLinkCoreBox" : "hiddenLinkPortBox" : "showNone"}>
                            { fromLinks.includes(coreData.id) ? fromLinks.map((from, index) => (coreData.id == from ? (hiddenData.map((a, i) => (a == toLinks[index] ? (<p style = {{ color: parentDataColor[i] }}>{hint_to[index]}-{parentData[i]}<p>erw</p></p>) : (<></>)))) : (<></>) )) : 
                            toLinks.map((to, index1) => (coreData.id == to ? (hiddenData.map((a, j) => (a == fromLinks[index1] ? (<p style = {{ color: parentDataColor[j] }}>{hint_from[index1]}-{parentData[j]}</p>) : (<></>)))) : (<></>)))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              : endElement.map((coreData, index) => (
                  <div key={coreData.id} style={{display: 'flex'}}>
                  <div className={"itemParent"}>
                    <div
                      id={`${coreData.id}-${fieldId}`}
                      key={coreData.id}
                      className={mode == "port" ? "itemPort" : "itemCore"}
                      style={{
                        background: coreData.color,
                        color: coreData.textColor,
                        fontSize: coreData.fontSize,
                      }}
                      >
                      {coreData.name}
                    </div>
                  </div>
                  <div className={rootElement.positionType == 'right' ? "hiddenLinkPortBox" : "hiddenLinkCoreBox"}>
                      { fromLinks.includes(coreData.id) ? fromLinks.map((from, index) => (coreData.id == from ? (hiddenData.map((a, i) => (a == toLinks[index] ? (<p style = {{ color: parentDataColor[i] }}>{hint_to[index]}-{parentData[i]}{data.positionType}</p>) : (<></>)))) : (<></>) )) : 
                      toLinks.map((to, index1) => (coreData.id == to ? (hiddenData.map((a, j) => (a == fromLinks[index1] ? (<p style = {{ color: parentDataColor[j] }}>{hint_from[index1]}-{parentData[j]}{data.positionType}</p>) : (<></>)))) : (<></>)))}
                  </div>
                </div>
                ))
              }
          </div>
        </div>
      </div>
    );
  };

  renderLeftRoot() {
    const conData = JSON.parse(this.props.value);
    let rootElement = splitRoot(conData);
    rootElement = sortIndexRoot(rootElement);
    
    return (
      <div>
        {
          rootElement.left.map((rootLeftData, index)=>(
            <div key={index} className={"rootContent"}>
              {this.renderConnect(rootLeftData.mode, rootLeftData.id)}
            </div>
          ))
        }
      </div>
    )
  }

  renderRightRoot() {
    
    const conData = JSON.parse(this.props.value);
    let rootElement = splitRoot(conData);
    rootElement = sortIndexRoot(rootElement);
    return (
      <div>
        {
          rootElement.right.map((rootRightData, index)=>(
            <div key={index} className={"rootContent"}>
              {this.renderConnect(rootRightData.mode, rootRightData.id)}
            </div>
          ))
        }
      </div>
    )
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

  handleChangeState = (section, state) => {
    const sectionState = { ...this.state[section], ...state };
    this.setState({ [section]: sectionState });
  }

  handleClickLegendItem = (item) => {
    const features = item.geometry
      ? lodash.filter(this.state.data.features, { id: item.id })
      : item.groups
        ? lodash.filter(this.state.data.features, (f) => (f.properties.section === item.id))
        : lodash.filter(this.state.data.features, (f) => (f.properties.section === item.section) && (f.properties.group === item.id));
  }
  sorted = (value) => { 
    const result = value ;
    this.setState({
      sorted_result: result
    }); 
  }

  renderConfigsControl = () => {
    return (
      <Controls.ConfigsControl
        draw={this.state.draw}
        configs={this.state.configs}
        actions={{
          onFullScreenClick: () => {
            const map = document.querySelector(`#${this.id}`);
            const map1 = document.querySelector(`.diagramContainer`);
            
            const a = window.innerWidth - 500; 
            const b = map1.height; 
            if (!this.state.configs.fullScreen) {
              map.style.position = 'fixed';
              map.style.top = '0px';
              map.style.left = '0px';
              map.style['z-index'] = 10000;
              map.style.width = window.innerWidth + 'px';
              map.style.height = window.innerHeight + 'px';
              map1.style.width = window.innerWidth + 'px'; //770, 700
              map1.style.height = window.innerHeight + 'px'; 
              this.setState({ zoomState: true });
            } else {
              map.style.removeProperty('position');
              map.style.removeProperty('top');
              map.style.removeProperty('left');
              map.style.removeProperty('z-index');
              map.style.removeProperty('width');
              map1.style.width = a + 'px'; //770, 700
              map1.style.height = '500px'; 
              // map1.style.width = '572px'; 
              // map1.style.height = '500px'; 
              this.setState({ zoomState: false });

            }

            const content = document.querySelector(`#${this.id} .diagramContainer`);

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
          onToggleClick: () => this.handleChangeState('configs', { legendShow: !this.state.configs.legendShow }),
          
        }}
      />
    );
  }

  renderControls = () => {
    return (
      <div className="view-map-controls">
        {this.renderConfigsControl()}
      </div>
    );
  }
  render() {
    const _this = this; 
    let diagram_height = document.querySelector('.diagramContainer'); 
    var winsize = 0 , width = this.state.zoomState ? window.innerWidth : window.innerWidth - 500;
    var height = this.state.zoomState ? window.innerHeight : 500;
    const real_style = { width: width + 'px', display: 'flex', height: height + 'px'}
    if (diagram_height !== null) {
      winsize = diagram_height.offsetHeight;
    }
    
    const label = this.props.label;
    const disabled = this.props.disabled;
    const styles = this.getStyles(this.state.configs);
    const {onChange} = this.props;
    const conData = JSON.parse(_this.props.value);
    return (
      <div className="view-map" id={this.id} styles={styles}>
        {label}
        <div style = {{ display: 'flex' }}>
          <Legend
            map={this.map}
            data={conData}
            draw={this.state.draw}
            legend={this.state.legend}
            configs={this.state.configs}
            onChange={ onChange } 
            sorted_result = {this.state.sorted_result}
            onTickChange = { this.handleChangeState }
            onClickItem={this.handleClickLegendItem}
            win_size = {winsize}
            sorted = {this.sorted}
          />
          <StyledContainer>
            <div ref={this.container} className={ disabled ? "diagramDisabled diagramContainer" : "diagramContainer" } id="diagramContainer" style = {real_style}>
              <div style={{padding: '10px 0px 0px 10px'}}>{this.renderControls()}</div>
              <div className="diagramContainerItem" >
                { this.renderLeftRoot() }
                { this.renderRightRoot() }
              </div>
            </div>
          </StyledContainer>
        </div>
      </div>
    );
  }
}
