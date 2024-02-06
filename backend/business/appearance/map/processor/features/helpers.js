import lodash from 'lodash-es';

import * as CONSTANTS from './constants.js';

export const getProperty = (feature = {}, context = {}, name) => {
  const { geometry = {}, properties = {} } = feature;

  let property = lodash.isNil(properties[name])
    ? properties[CONSTANTS.PROPERTY_SHORT_NAMES[name]]
    : properties[name];

  if (lodash.isNil(property)) {
    if (properties.editable) {
      if (properties.editable === 'associated') {
        if (context.properties[geometry.type][`assoc_${properties.model}`]) {
          const p = lodash.find(context.properties[geometry.type][`assoc_${properties.model}`], { condition: 'true' }) || { properties: {} };
          property = p.properties[name];
        }
      } else {
        property = context.properties[geometry.type][properties.editable].properties[name];
      }
    } else {
      if (properties['follow-up:editable']) {
        if (properties['follow-up:editable'] === 'associated') {
          const [ model ] = properties['follow-up'].split(':');

          if (context.properties[geometry.type][`assoc_${model}`]) {
            const p = lodash.find(context.properties[geometry.type][`assoc_${model}`], { condition: 'true' }) || { properties: {} };
            property = p.properties[name];
          }
        } else {
          property = context.properties[geometry.type][properties['follow-up:editable']].properties[name];
        }
      }
    }
  }

  return lodash.isNil(property)
    ? context.properties[geometry.type]['other'].properties[name]
    : property;
};

export const getPName = (feature, context, key) => {
  const { geometry = {}, properties = {} } = feature;

  if (properties.editable) {
    const { properties: p = {} } = context.properties[geometry.type][properties.editable] || {};

    return p['name']
      || p['p-name']
      || p['pn']
      || `${CONSTANTS.EDITABLE_MAP[properties.editable]} ${geometry.type}`;
  }

  return properties['name']
    || properties['p-name']
    || properties['pn']
    || `${key}`;
};
