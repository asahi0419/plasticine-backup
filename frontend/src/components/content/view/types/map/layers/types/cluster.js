import Supercluster from 'supercluster';
import { IconLayer } from '@deck.gl/layers';
import lodash from 'lodash';

import * as CONFIGS from '../../configs';
import * as Helpers from '../helpers';
import * as CustomLayers from '.';

const index = new Supercluster({
  maxZoom: CONFIGS.DEFAULT_VIEW_STATE.maxZoom,
  radius: CONFIGS.DEFAULT_CONFIGS.clusterRadius,
});

export default class extends CustomLayers.BaseLayer {
  shouldUpdateState({ changeFlags }) {
    return changeFlags.dataChanged || changeFlags.viewportChanged;
  }

  updateState({ props, oldProps, changeFlags }) {
    if (changeFlags.dataChanged) {
      index.load(props.data);
    }

    if (changeFlags.dataChanged || changeFlags.viewportChanged) {
      const bounds = this.context.viewport.getBounds();
      const zoom = Math.floor(this.context.viewport.zoom);

      const state = lodash.reduce(index.getClusters(bounds, zoom), (result, feature) => {
        feature.properties.cluster_id
          ? result.clusters[feature.properties.cluster_id] = createCluster(props, feature)
          : result.features.push(feature);

        return result;
      }, { clusters: {}, features: [], zoom });

      this.setState(state);
    }
  }

  getPickingInfo({ info, mode }) {
    if (info.object && (mode !== 'hover')) {
      const feature = info.object;

      if (feature.properties.cluster_id) {
        const z = index.getClusterExpansionZoom(feature.properties.cluster_id);
        info.z = z > CONFIGS.DEFAULT_VIEW_STATE.maxZoom ? CONFIGS.DEFAULT_VIEW_STATE.maxZoom : z;

        this.setState({ clusters: this.state.clusters });
      }
    }

    return info;
  }

  renderLayers() {
    const { features = [] } = this.state;
    const { configs, draw, onClick, onHover } = this.props;

    const layers = [];

    if (features.length) {
      lodash.each(['pixels', 'meters'], (sizeUnits) => {
        layers.push(new CustomLayers.IconLayer({
          id: `cluster-icon-${sizeUnits}`,
          data: features,
          draw,
          configs,
          onClick,
          onHover,
          sizeUnits,
          getFilterValue: (f) => {
            const su = Helpers.getProperty(draw.properties, f, 'p-size-units')

            return (su === sizeUnits)
              ? 1
              : 0;
          },
        }));
        layers.push(new CustomLayers.TextLayer({
          id: `cluster-text-${sizeUnits}`,
          subLayer: true,
          data: features,
          sizeUnits,
          getFilterValue: (f) => {
            const su = Helpers.getProperty(draw.properties, f, 'p-size-units')
            const pt = Helpers.getProperty(draw.properties, f, 'p-text')

            return (su === sizeUnits)
              && pt
                ? 1
                : 0;
          },
        }));
      });
    }

    const clusters = Object.values(this.state.clusters);

    if (clusters.length) {
      layers.push(new IconLayer({
        id: `clusters`,
        data: clusters,
        onClick,
        onHover,
        pickable: true,
        sizeScale: 1,
        getSize: (f) => CONFIGS.DEFAULT_CONFIGS.clusterRadius,
        getIcon: (f) => f.icon,
        getPosition: (f) => f.geometry.coordinates,
      }));
    }

    return layers;
  }
}

function createCluster(props, feature) {
  const groupSegments = createGroupSegments('marker-color', feature.properties.cluster_id, props);
  const countSegments = createCountSegments(groupSegments);

  feature.icon = createDonutChartIcon(countSegments);

  return feature;
}

function createDonutChartIcon(segments) {
  const props = {
    radius: CONFIGS.DEFAULT_CONFIGS.clusterRadius,
    innerRadius: 0,
    radiusMultiplier: 0.6,
    fontColor: 'white',
    segmentOpacity: 0.9,
    circleOpacity: 0.3,
    total: 0,
    fontSize: 36,
  };

  const colors = Object.keys(segments);
  const counts = Object.values(segments);
  const offsets = [];

  for (const count of counts) {
    offsets.push(props.total);
    props.total += count;
  }

  const rm = Math.round(props.radius * props.radiusMultiplier);
  const w = props.radius * 2;

  const svg = `<svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${props.fontSize}px sans-serif; display: block; fill: ${props.fontColor};" xmlns="http://www.w3.org/2000/svg">
  ${lodash.map(offsets, (o, i) => donutSegment(offsets[i] / props.total, (offsets[i] + counts[i]) / props.total, props.radius, props.innerRadius, colors[i], props.segmentOpacity))}
  <circle cx="${props.radius}" cy="${props.radius}" r="${rm}" fill="black" fill-opacity="${props.circleOpacity}" fill-rule="nonzero" />
  <text dominant-baseline="central" transform="translate(${props.radius}, ${props.radius})">
    ${props.total}
  </text>
</svg>`;

  return { url: `data:image/svg+xml;base64,${btoa(svg)}`, width: w, height: w };
}

function donutSegment(start, end, r, rm, color, opacity) {
  if (end - start === 1)
    end -= 0.00001;
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  const x0 = Math.cos(a0),
    y0 = Math.sin(a0);
  const x1 = Math.cos(a1),
    y1 = Math.sin(a1);
  const largeArc = end - start > 0.5
    ? 1
    : 0;

  return `<path d="M ${r + rm * x0} ${r + rm * y0} L ${r + r * x0} ${
  r + r * y0} A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
  r + rm * x1} ${r + rm * y1} A ${rm} ${rm} 0 ${largeArc} 0 ${r + rm * x0} ${
  r + rm * y0}" fill="${color}" fill-opacity="${opacity}" />`;
}

function createGroupSegments(key, clusterId, props) {
  return lodash.reduce(index.getChildren(clusterId), (result, c) => {
    return c.properties.cluster_id
      ? [...result, ...createGroupSegments(key, c.properties.cluster_id, props)]
      : [...result, c.properties[key] || (props.draw.properties?.point?.properties || {})[key]];
  }, []).sort();
}

function createCountSegments(items) {
  return lodash.reduce(items, (result, key) => {
    result[key] = result[key] ? (result[key] + 1) : 1;
    return result;
  }, {});
}
