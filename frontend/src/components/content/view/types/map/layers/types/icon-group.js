import lodash from 'lodash';

import * as CONFIGS from '../../configs';
import * as Helpers from '../helpers';
import * as Types from '.';

export default class extends Types.BaseLayer {
  constructor(props) {
    super(props);

    this.state = { expanded: this.props.expanded }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ expanded: nextProps.expanded })
  }

  onClick = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  renderGroup = () => {
    const layers = [];

    const center = lodash.cloneDeep(this.props.data[0])
    center.properties['marker-symbol'] = 'circle';
    center.properties['marker-color'] = '#8A8A8A';
    center.properties['p-marker-size'] = 32;
    center.properties['p-text'] = this.state.expanded ? '' : `${this.props.data.length}`;
    center.properties['p-text-color'] = '#FFFF66';
    center.properties['p-text-size'] = 14;

    layers.push(new Types.IconLayer({
      id: `icon-group-icon-${this.props.id}`,
      data: [ center ],
      pickable: true,
      onClick: this.onClick,
    }));
    layers.push(new Types.TextLayer({
      id: `icon-group-text-${this.props.id}`,
      onClick: this.onClick,
      data: [ center ],
    }));

    return layers;
  }

  renderIcons = () => {
    const layers = [];

    const radius = Math.ceil(CONFIGS.CLUSTER.scale / this.context.viewport.scale * 1000) / 1000;
    const data = createGroupExpanded(this.props.data, radius)

    lodash.each(['pixels', 'meters'], (sizeUnits) => {
      layers.push(new Types.IconLayer({
        id: `icon-group-${this.props.id}-icon-${sizeUnits}`,
        data,
        pickable: true,
        draw: this.props.draw,
        configs: this.props.configs,
        onClick: this.props.onClick,
        onHover: this.props.onHover,
        sizeUnits,
        getFilterValue: (f) => {
          const su = Helpers.getProperty(this.props.draw.properties, f, 'p-size-units')

          return this.state.expanded
            && !this.props.exclude.includes(f.id)
            && (su === sizeUnits)
            ? 1
            : 0
        },
      }));
      layers.push(new Types.TextLayer({
        id: `icon-group-${this.props.id}-text-${sizeUnits}`,
        subLayer: true,
        data,
        sizeUnits,
        getFilterValue: (f) => {
          const su = Helpers.getProperty(this.props.draw.properties, f, 'p-size-units')
          const pt = Helpers.getProperty(this.props.draw.properties, f, 'p-text')

          return this.state.expanded
            && !this.props.exclude.includes(f.id)
            && (su === sizeUnits)
            && pt
            ? 1
            : 0
        },
      }));
    });

    return layers;
  }

  renderLayers = () => {
    return [
      ...this.renderGroup(),
      ...this.renderIcons()
    ];
  }
};

function createGroupExpanded(features = [], radius) {
  const [ feature ] = features;
  const center = feature.geometry.coordinates;

  const distanceX = radius / (111.320 * Math.cos(center[1] * Math.PI / 180));
  const distanceY = radius / 110.574;

  return lodash.map(features, (feature, i) => {
    const theta = (i / features.length) * (2 * Math.PI);
    return {
      properties: feature.properties,
      geometry: {
        type: 'Point',
        coordinates: [
          center[0] + distanceX * Math.cos(theta),
          center[1] + distanceY * Math.sin(theta),
        ],
      },
    };
  });
}
