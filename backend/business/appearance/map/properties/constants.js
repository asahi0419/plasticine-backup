export const DEFAULT_PROPERTIES = {
  Point: {
    'marker-color': '#0000ff',
    'marker-size': 'medium',
    'marker-symbol': 'circle',
    'marker-opacity': 1,
    'p-size-units': 'pixels',
    'p-name': undefined,
    'p-text-size': 11,
    'p-text-anchor': 'center',
    'p-text-offset': [0, 0],
    'p-text-color': '#202020',
    'p-legend': 1,
    'p-marker-border-width': 0,
    'p-marker-border-color': '#2c76d5',
    'p-marker-border-opacity': 1,
  },
  LineString: {
    'marker-symbol': 'share alternate',
    'stroke': '#0000ff',
    'stroke-width': 1,
    'stroke-opacity': 1,
    'p-name': undefined,
    'p-legend': 1,
  },
  Polygon: {
    'marker-symbol': 'gem outline',
    'stroke': '#0000ff',
    'stroke-width': 1,
    'stroke-opacity': 1,
    'fill': '#0000ff',
    'fill-opacity': 1,
    'p-name': undefined,
    'p-legend': 1,
  },
};

export const FREE_PROPERTIES = {
  Point: {
    'marker-color': '#2c76d5',
    'marker-size': 'medium',
    'marker-symbol': 'bullseye',
    'marker-opacity': 1,
    'p-size-units': 'pixels',
    'p-name': undefined,
    'p-text-size': 11,
    'p-text-anchor': 'center',
    'p-text-offset': [ 0, 0 ],
    'p-text-color': '#202020',
    'p-legend': 1,
    'p-marker-size': 18,
    'p-marker-border-width': 0,
    'p-marker-border-color': '#2c76d5',
    'p-marker-border-opacity': 0,
  },
  LineString: {
    'marker-symbol': 'minus',
    'stroke': '#2184ff',
    'stroke-width': 3,
    'stroke-opacity': 1,
    'p-name': undefined,
    'p-legend': 1,
  },
  Polygon: {
    'marker-symbol': 'square',
    'stroke': '#2184ff',
    'stroke-width': 3,
    'stroke-opacity': 1,
    'fill': '#2184ff',
    'fill-opacity': 1,
    'p-name': undefined,
    'p-legend': 1,
  },
};

export const ASSOCIATED_PROPERTIES = {
  Point: {
    ...FREE_PROPERTIES.Point,
    'marker-color': '#faa60a',
  },
  LineString: {
    ...FREE_PROPERTIES.LineString,
    'stroke': '#faa60a',
  },
  Polygon: {
    ...FREE_PROPERTIES.Polygon,
  },
};
