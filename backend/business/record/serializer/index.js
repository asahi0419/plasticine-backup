import Promise from 'bluebird';

import jsonSerializer from './json.js';
import geoJSONSerializer from './geojson.js';
import csvSerializer from './csv.js';
import xlsxSerializer from './xlsx.js';

const serializers = {
  json: promisify(jsonSerializer),
  geojson: promisify(geoJSONSerializer),
  csv: csvSerializer,
  xlsx: xlsxSerializer,
};

export default function (data, format = 'json', params, context) {
  const serializer = serializers[format];
  return serializer(data, params, context);
}

function promisify(serializer) {
  return (input, params) => Promise.resolve(serializer(input, params));
}
