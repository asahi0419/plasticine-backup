import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash/lang';
import { Message } from 'semantic-ui-react';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5plugins_exporting from '@amcharts/amcharts5/plugins/exporting';

let am4core = null
let am4charts = null
let am4maps = null
let am4themes_animated = null
let am4geodata_worldLow = null
let am4plugins_forceDirected = null
let am4plugins_sunburst = null

let am5 = null
let am5flow = null
let am5map = null
let am5hierarchy = null
let am5xy = null
let am5radar = null
let am5percent = null
let am5stock = null
let am5geodata_worldLow = null

if (process.browser) {
  am4core = require('@amcharts/amcharts4/core')
  am4charts = require('@amcharts/amcharts4/charts')
  am4maps = require('@amcharts/amcharts4/maps')
  am4themes_animated = require('@amcharts/amcharts4/themes/animated')
  am4geodata_worldLow = require('@amcharts/amcharts4-geodata/worldLow')
  am4plugins_forceDirected = require('@amcharts/amcharts4/plugins/forceDirected')
  am4plugins_sunburst = require('@amcharts/amcharts4/plugins/sunburst')
  am5 = require('@amcharts/amcharts5')
  am5flow = require('@amcharts/amcharts5/flow')
  am5map = require('@amcharts/amcharts5/map')
  am5hierarchy = require('@amcharts/amcharts5/hierarchy')
  am5xy = require('@amcharts/amcharts5/xy')
  am5radar = require('@amcharts/amcharts5/radar')
  am5percent = require('@amcharts/amcharts5/percent')
  am5stock = require('@amcharts/amcharts5/stock')
  am5geodata_worldLow = require('@amcharts/amcharts5-geodata/worldLow')
}

import Sandbox from '../../../sandbox';
import { wrapScript } from './helpers';
import { makeUniqueID } from '../../../helpers';

const CHART_CONTEXT_4 = {
  am4core,
  am4charts,
  am4maps,
  am4themes_animated,
  am4geodata_worldLow,
  am4plugins_forceDirected,
  am4plugins_sunburst,
};

const CHART_CONTEXT_5 = {
  am5,
  am5flow,
  am5map,
  am5hierarchy,
  am5xy,
  am5radar,
  am5percent,
  am5stock,
  am5themes_Animated,
  am5geodata_worldLow,
  am5plugins_exporting,
};

export default class Chart extends Component {
  static propTypes = {
    id: PropTypes.string,
    error: PropTypes.object,
    scope: PropTypes.object.isRequired,
    builder: PropTypes.string.isRequired,
    handleError: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.id = props.id || makeUniqueID();
  }

  componentDidMount() {
    this.build(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.scope, this.props.scope)) {
      this.build(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  build = async (props) => {
    if (props.error) return;

    const script = wrapScript(props.builder, props.version);
    const chartContext = this.getContext(props.version);
    const context = { ...chartContext, scope: props.scope, chartdiv: this.id };
    const sandbox = new Sandbox(context).setErrorHandler(props.handleError);

    if (this.chart) this.chart.dispose()
    this.chart = window.chart = await sandbox.executeScript(script, {}, `chart/${this.props.id}/client_script`);
  }

  getContext = (version) => {
    return (version === 'v4' ? CHART_CONTEXT_4 : CHART_CONTEXT_5);
  }

  renderError() {
    const { error } = this.props;

    return (
      <Message negative>
        <Message.Header>{error.name}</Message.Header>
        <p>{error.description}</p>
      </Message>
    );
  }

  renderChart() {
    const style = { width: '100%', height: '100%' };

    return <div id={this.id} className="chart" style={style}></div>;
  }

  render() {
    return this.props.error
      ? this.renderError()
      : this.renderChart();
  }
}
