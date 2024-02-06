import { compact } from 'lodash/array';
import { reduce } from 'lodash/collection';

const PARAMS_TO_STYLES_MAP = {
  background_color: 'backgroundColor',
  border_width: 'borderWidth',
  border_color: 'borderColor',
  font_size: 'fontSize',
  align: 'textAlign',
  min_width: 'minWidth',
};

const STYLES_GENERATORS = {
  width:            (value) => (`${value}`.includes('%') ? getStyleValue(value, 25, 1, 100, '%') : getStyleValue(value, 300, 50, 1800, 'px')),
  minWidth:         (value) => value,
  backgroundColor:  (value) => value || 'rgba(255, 255, 255, 1)',
  padding:          (value) => parsePadding(value) || [0, 0, 0, 0],
  margin:           (value) => value || 20,
  border:           (value) => value,
  borderWidth:      (value) => getStyleValue(value, 1, 1, 5) || 1,
  borderColor:      (value) => value || 'rgba(0, 0, 0, 1)',
  color:            (value) => value || 'rgba(0, 0, 0, 0.87)',
  fontSize:         (value) => getStyleValue(value, 1, 0.1, 3),
  textAlign:        (value) => value,
};

const CSS_RULES_GENERATORS = {
  width:            ({ width }) => width,
  minWidth:         ({ minWidth }, unit) => `${minWidth}${unit || 'px'}`,
  backgroundColor:  ({ backgroundColor }) => backgroundColor,
  padding:          ({ padding }, unit) => padding.map((v) => `${v}${unit || 'px'}`).join(' '),
  margin:           ({ margin }, unit) => `${margin}${unit || 'px'}`,
  border:           ({ border, borderWidth, borderColor }) => border ? [borderWidth + 'px', borderColor, 'solid'].join(' ') : 'none',
  color:            ({ color }) => color,
  fontSize:         ({ fontSize }, unit) => `${fontSize}${unit || 'em'}`,
  textAlign:        ({ textAlign }) => textAlign,
};

export default class Styles {
  constructor(styles, override) {
    this.styles = styles;
    this.override = !!override;
  }

  static initFromParams(params) {
    const styles = reduce(params, (result, value, key) => {
      const styleKey = getStyleKey(key);
      const generator = STYLES_GENERATORS[styleKey];
      if (generator) result[styleKey] = generator(value);
      return result;
    }, {});

    return new Styles(styles, params.override_styles);
  }

  mergeWith(another) {
    const styles = another.override
      ? { ...this.styles, ...another.styles }
      : { ...another.styles, ...this.styles };

    return new Styles(styles, another.override);
  }

  getCSSRules(keys) {
    return reduce(keys, (result, key) => {
      let [ruleName, unit] = key.split(':');
      const generator = CSS_RULES_GENERATORS[ruleName];

      if (generator && this.styles[ruleName]) {
        result[ruleName] = generator(this.styles, unit);
      }

      return result;
    }, {});
  }
}

function getStyleKey(key) {
  return PARAMS_TO_STYLES_MAP[key] || key;
}

function getStyleValue(value, def, min, max, unit) {
  if (!value) value = def;
  if (parseFloat(value) < min) value = min;
  if (parseFloat(value) > max) value = max;

  return unit ? parseFloat(value) + unit : parseFloat(value);
}

function parsePadding(value) {
  return compact(value.replace(/[{}]/g, '').trim().split(','));
}
