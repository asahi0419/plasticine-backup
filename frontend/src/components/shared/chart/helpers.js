export const wrapScript = (script, version) => {
  if (script) {
    if (version === 'v4') {
      return `const am4core = p.am4core;
const am4charts = p.am4charts;
const am4maps = p.am4maps;
const am4themes_animated = p.am4themes_animated;
const am4geodata_worldLow = p.am4geodata_worldLow;
const am4plugins_forceDirected = p.am4plugins_forceDirected;
const am4plugins_sunburst = p.am4plugins_sunburst;

const chartScript = ${script};

return chartScript(p.chartdiv, p.scope);
      `;
    } else {
      return `const am5 = p.am5;
const am5flow = p.am5flow;
const am5map = p.am5map;
const am5hierarchy = p.am5hierarchy;
const am5xy = p.am5xy;
const am5radar = p.am5radar;
const am5percent = p.am5percent;
const am5stock = p.am5stock;
const am5themes_Animated = p.am5themes_Animated;
const am5geodata_worldLow = p.am5geodata_worldLow;
const am5plugins_exporting = p.am5plugins_exporting;

const chartScript = ${script};

const chart = chartScript(p.chartdiv, p.scope);
chart.exporting = am5plugins_exporting.Exporting.new(chart, {
  menu: am5plugins_exporting.ExportingMenu.new(chart, {})
});

return chart
      `;
    }
  }
}
