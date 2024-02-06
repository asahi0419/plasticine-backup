export const DEBUG = false;

export const root_padding = 0; 
export const mid_padding = 15; 
export const end_padding = 30; 
export const invisible = 'none'; 

export const DEFAULT_MAP_SOURCE = 'osm-tiles';
export const DEFAULT_LEGEND_MIN_WIDTH = 150;
export const DEFAULT_LEGEND_MAX_WIDTH = 350;
export const DEFAULT_BOUNDS = [[280, 20], [-280, 20]];
export const DEFAULT_VIEW_PADDING = 40;
export const DEFAULT_PICKING_RADIUS = 5;
export const BOUND_POSITION_KEYS = ['latitude', 'longitude', 'zoom', 'pitch', 'bearing'];
export const MAX_BOUNDS_LAT = { sw: -80, ne: 80 };
export const LIST_ITEMS_LIMIT = 99;

export const DEFAULT_VIEW_STATE = {
  zoom: 0,
  minZoom: 0,
  maxZoom: 18,
  bearing: 0,
  dragPan: true,
};

export const DEFAULT_CONFIGS = {
  legendShow: true,
  legendWidth: 220,
  contentPadding: 80,
  fullScreen: false,
  zoomArea: false,
  cluster: true,
  clusterRadius: 80,
  freeze: false,
  source: DEFAULT_MAP_SOURCE,
  scale: { hide: false },
};

export const DEFAULT_LEGEND = {
  focus: null,
  sorted: null,
  search: '',
  unchecked: { f: [], s: [], g: [] },
  sectionsSort: [],
  sectionsColl: [],
};

export const DEFAULT_DRAW = {
  enable: false,
  mode: null,
  selection: [],
  hovering: [],
  follow: {},
  multiselect: false,
  properties: {
    point: {},
    line: {},
    polygon: {},
  }
};

export const DEFAULT_EVENTS = {
  hover: { point: 'tip', line: 'tip', polygon: 'no' },
  click: { point: 'form', line: 'form', polygon: 'tip' },
};

export const DEFAULT_EVENT_TIMEOUT = 500;

export const DEFAULT_DATA = {
  features: [],
  sections: [],
  groups: [],
};

export const ICON_TYPES = {
  'Point': 'circle',
  'LineString': 'share alternate',
  'Polygon': 'gem outline',
};
export const COLOR_TYPES = {
  'Point': 'marker-color',
  'LineString': 'stroke',
  'Polygon': 'fill',
};
export const TARGET_TYPES = {
  'Point': 'point',
  'LineString': 'line',
  'Polygon': 'polygon',
};
export const DRAW_TYPES = {
  'Point': 'point',
  'LineString': 'lineString',
  'Polygon': 'polygon',
};

export const CLUSTER = {
  icon: 'circle',
  iconSize: 70,
  iconColor: '#000000',
  iconColorAlpha: 0.2,
  sizeScale: 60,
  sizeScaleExpanded: 45,
  textColor: '#ffffff',
  textSize: 20,
  fontWeight: 700,
  colorAlpha: 0.8,
  lineColor: '#888888',
  scale: 2500,
  polygonLength: 32,
  circleRadiusExpanded: 0.0125,
  polygonRadiusExpanded: 0.005,
  minSegmentLength: 1,
};

export const OSM_TILES_MAP_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.osm.org/{z}/{x}/{y}.png',
        'https://b.tile.osm.org/{z}/{x}/{y}.png',
        'https://c.tile.osm.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    },
  },
  layers: [
    {
      id: 'oms-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export const OSM_TILES_MAP_STYLE_WITH_OSMBUILDINGS = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.osm.org/{z}/{x}/{y}.png',
        'https://b.tile.osm.org/{z}/{x}/{y}.png',
        'https://c.tile.osm.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    },
    "osmbuildings":{
      "type":"vector",
      "url":"https://data.osmbuildings.org/0.2/anonymous/tile.json"
    }
  },
  layers: [
    {
      id: 'oms-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 20,
    },
    {
      "id":"building-footprint",
      "type":"fill",
      "source":"osmbuildings",
      "source-layer":"building",
      "filter":[
        "all",
        [
          "==",
          "minHeight",
          0
        ]
      ],
      "layout":{

      },
      "paint":{
        "fill-color":"#000000",
        "fill-opacity":{
          "stops":[
            [
              16.5,
              0
            ],
            [
              17.5,
              0.25
            ]
          ]
        }
      }
    },
    {
      "id":"building-shadow",
      "type":"fill",
      "source":"osmbuildings",
      "source-layer":"building",
      "filter":[
        "all",
        [
          "==",
          "minHeight",
          0
        ]
      ],
      "layout":{
        "visibility":"none"
      },
      "paint":{
        "fill-color":"#000000",
        "fill-opacity":{
          "stops":[
            [
              15,
              0
            ],
            [
              15.5,
              0.75
            ]
          ]
        },
        "fill-translate":{
          "stops":[
            [
              15,
              [
                2,
                2
              ]
            ],
            [
              18,
              [
                32,
                32
              ]
            ]
          ]
        }
      }
    },
    {
      "id":"building",
      "type":"fill-extrusion",
      "source":"osmbuildings",
      "source-layer":"building",
      "paint":{
        "fill-extrusion-color":[
          "string",
          [
            "get",
            "color"
          ],
          [
            "match",
            [
              "string",
              [
                "get",
                "material"
              ],
              ""
            ],
            "brick",
            "#cc6633",
            "bronze",
            "#ffeecc",
            "canvas",
            "#fff8f0",
            "clay",
            "#cc9966",
            "concrete",
            "#999999",
            "copper",
            "#a0e0d0",
            "glass",
            "#e8f8f8",
            "gold",
            "#ffcc00",
            "metal",
            "#aaaaaa",
            "panel",
            "#fff8f0",
            "plants",
            "#009933",
            "plaster",
            "#999999",
            "roof_tiles",
            "#887766",
            "silver",
            "#cccccc",
            "slate",
            "#666666",
            "stone",
            "#996666",
            "tar_paper",
            "#333333",
            "wood",
            "#deb887",
            "#c8beb4"
          ]
        ],
        "fill-extrusion-height":[
          "number",
          [
            "get",
            "height"
          ],
          [
            "*",
            [
              "number",
              [
                "get",
                "levels"
              ],
              3
            ],
            3
          ]
        ],
        "fill-extrusion-base":[
          "number",
          [
            "get",
            "minHeight"
          ],
          [
            "*",
            [
              "number",
              [
                "get",
                "minLevel"
              ],
              0
            ],
            3
          ]
        ],
        "fill-extrusion-opacity":{
          "stops":[
            [
              15,
              0
            ],
            [
              15.5,
              1
            ],
            [
              16,
              1
            ],
            [
              17.5,
              0.6
            ]
          ]
        }
      },
      "filter":[
        "!=",
        [
          "string",
          [
            "get",
            "shape"
          ],
          ""
        ],
        "none"
      ]
    },
    {
      "id":"building-roof",
      "type":"fill-extrusion",
      "source":"osmbuildings",
      "source-layer":"building",
      "layout":{

      },
      "paint":{
        "fill-extrusion-color":[
          "string",
          [
            "get",
            "roofColor"
          ],
          [
            "match",
            [
              "string",
              [
                "get",
                "roofMaterial"
              ],
              ""
            ],
            "brick",
            "#cc6633",
            "bronze",
            "#ffeecc",
            "canvas",
            "#fff8f0",
            "clay",
            "#cc9966",
            "concrete",
            "#999999",
            "copper",
            "#a0e0d0",
            "glass",
            "#e8f8f8",
            "gold",
            "#ffcc00",
            "metal",
            "#aaaaaa",
            "panel",
            "#fff8f0",
            "plants",
            "#009933",
            "plaster",
            "#999999",
            "roof_tiles",
            "#887766",
            "silver",
            "#cccccc",
            "slate",
            "#666666",
            "stone",
            "#996666",
            "tar_paper",
            "#333333",
            "wood",
            "#deb887",
            "#c8beb4"
          ]
        ],
        "fill-extrusion-height":[
          "number",
          [
            "get",
            "height"
          ],
          [
            "*",
            [
              "number",
              [
                "get",
                "levels"
              ],
              3
            ],
            3
          ]
        ],
        "fill-extrusion-base":[
          "number",
          [
            "get",
            "height"
          ],
          [
            "*",
            [
              "number",
              [
                "get",
                "levels"
              ],
              3
            ],
            3
          ]
        ],
        "fill-extrusion-opacity":{
          "stops":[
            [
              15,
              0
            ],
            [
              15.5,
              1
            ],
            [
              16,
              1
            ],
            [
              17.5,
              0.75
            ]
          ]
        }
      },
      "filter":[
        "any",
        [
          "has",
          "roofColor"
        ],
        [
          "has",
          "roofMaterial"
        ],
        [
          "==",
          [
            "get",
            "type"
          ],
          "roof"
        ]
      ]
    },
  ],
};

export const MAP_STYLES_BY_SOURCE = {
  'osm-tiles': OSM_TILES_MAP_STYLE,
  'osmbuildings': OSM_TILES_MAP_STYLE_WITH_OSMBUILDINGS,
};
