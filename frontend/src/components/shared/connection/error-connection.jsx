import React, { Component } from "react";
import { jsPlumb } from "jsplumb";
import { makeUniqueID } from "../../../helpers";
import styled from "styled-components";
import Legend from './legend';
import PropTypes from 'prop-types';
import { cond } from "lodash";
import SearchBar from '../search-bar';
import ControlPanel from '../control-panel';
import * as CONSTANTS from '../../../constants';
import * as CONFIGS from './configs';
import { Icon } from 'semantic-ui-react'

const LegendMenuStyled = styled.div`
  position: relative;
  height: 500px; 
  overflow: hidden;

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    padding: 10px;

    > div {
      border-top, border-left, border-right: 1px solid #d9d9d9; 
    }
  }
`

const StyledContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%; 
  .diagramContainer {
    padding: 20px;
    width: 100%;
    height: 500px;
    border: 1px solid #d9d9d9;
    resize: vertical;
    overflow: auto;
    position: relative;
  }
  `;
  
const ErrorMsg = styled.span`
  color: red;

`

export default class ConnectionEditor extends Component {
  constructor(props) {
    super(props);
    
    this.id = `connection-${makeUniqueID()}`;
    this.map = {}; this.data = {}; this.legend = {}; this.configs = {};this.onChange = {};this.onTickChange = {};this.onClickItem = {}; 

  }
  handleClickLegendItem = () => {

  }
  onChange = () => {

  }
  handleChangeState = () => {

  }
  handleSearch = () => {

  }
  set_style = (size) => {
    return{
      height: size
    }
  }
  render() {
    
    let diagram_height = document.querySelector('.diagramContainer'); 
    var winsize = 0; 
    if (diagram_height !== null) {
       winsize = diagram_height.offsetHeight;
    }
    const style = this.set_style(winsize); 

    const label = this.props.label;
    const status = this.props.status;
    const chck = true, coll = true, sort = true; 
    const chckIcon = `${chck ? '' : 'check '}square outline`; // when false, tick; 
    const collIcon = `${coll ? 'plus' : 'minus'}`;
    const sortIcon = `sort alphabet ${sort ? 'down' : 'up'}`;

    return (
      <div>
        {label}
        <div className="view-map">
          <div style={{ zIndex: 1, height: '500px'}} className="view-map-legend">
            <div style = {{ display: 'flex'}}>
              <LegendMenuStyled vertical id="view-map-legend-menu" className="legend" >
                <SearchBar
                  style={{ height: '40px' }}
                  placeholder={ i18n.t('legend_search', { defaultValue: 'Legend search ...' })}
                  onSearch={this.handleSearch}
                />
                <ControlPanel>
                  <Icon name={chckIcon} />
                  <Icon name={collIcon} />
                  <Icon name={sortIcon} />
                </ControlPanel>
              </LegendMenuStyled>

              <StyledContainer>
                <div className="diagramContainer" style = {{ width: '100%'}}></div>
              </StyledContainer>
            </div>
          </div>
        </div>
        
        
        
        {
        status == "Break" && 
        <ErrorMsg>
          {i18n.t('json_valid_message', { defaultValue: 'JSON script is not valid, please contact system administrator'})}
        </ErrorMsg>
        }
      </div>
    );
  }
}
