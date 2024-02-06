import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import togeojson from '@mapbox/togeojson';
import { each } from 'lodash/collection';
import { isString } from 'lodash/lang';

import * as HELPERS from '../../../../helpers';

import Messenger from '../../../../messenger';

export const getImportsData = async (imports = {}, type, callback = () => {}) => {
  const { [type]: target } = imports;

  if (target) {
    if (isString(target) && HELPERS.isValidUrl(target)) {
      const time = (it) => ((new Date().getTime() - it.getTime()) / 1000);
      let it;

      if (type === 'zip') {
        it = new Date();
        callback({ message: 'ZIP: Downloading ...', percent: 0 });
        const zip = await downloadData(type, target);
        console.log('ZIP: Download', time(it));

        it = new Date();
        callback({ message: 'ZIP: Extracting ...', percent: 33 });
        const geojson = await convertZIPGEOJSON(zip);
        console.log('ZIP: Extract', time(it));

        it = new Date();
        callback({ message: 'ZIP: Parsing ...', percent: 66 });
        const geo = await convertZIPGEOJSONParse(geojson);
        console.log('ZIP: Parse', time(it));

        callback({ message: 'ZIP: Active', percent: 100 });
        return importsMapper(type)(geo.features);
      }

      if (type === 'kmz') {
        it = new Date();
        callback({ message: 'KMZ: Downloading ...', percent: 0 });
        const kmz = await downloadData(type, target);
        console.log('KMZ: Download', time(it));

        it = new Date();
        callback({ message: 'KMZ: Extracting ...', percent: 33 });
        const kml = await convertKMZKML(kmz);
        console.log('KMZ: Extract', time(it));

        it = new Date();
        callback({ message: 'KMZ: Parsing ...', percent: 66 });
        const geo = await convertKMLGEOJSON(kml);
        console.log('KML: Parse', time(it));

        callback({ message: 'KML: Active', percent: 100 });
        return importsMapper(type)(geo.features);
      }

      if (['json', 'geojson'].includes(type)) {
        it = new Date();
        callback({ message: 'GeoJSON: Downloading ...', percent: 0 });
        const geojson = await downloadData(type, target);
        console.log('GeoJSON: Download', time(it));

        it = new Date();
        callback({ message: 'GeoJSON: Extracting ...', percent: 33 });
        const geo = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(geojson)));
        console.log('GeoJSON: Extract', time(it));

        callback({ message: 'GeoJSON: Active', percent: 100 });
        return importsMapper(type)(geo.features);
      }
    } else {
      return { features: [] };
    }
  } else {
    return { features: [] };
  }
};

export const importsMapper = (type) => (features) => {
  const typeIdMap = {
    'zip': 'Import (zip)',
    'kmz': 'Import (kmz)',
    'geojson': 'Import (geo)',
  };

  each(features, (f, i) => {
    f.id = `${type}-${f.id || i}`;
    f.properties.section = typeIdMap[type];
    f.properties.group = 'default';

    if (f.properties) f.properties['p-legend'] = 1;
  });

  return features;
};

export const downloadData = async (type, url) => {
  return new Promise((resolve, reject) => {
    JSZipUtils.getBinaryContent(url, (error, data) => {
      if (error) {
        Messenger.error({ header: 'Download Error', list: [`Cannot download ${type} file`, `Description logged to console`] });
        console.log(error);
      }
      resolve(data);
    });
  });
};

export const convertKMZKML = async (input) => {
  if (!input) return;

  const zip = await JSZip.loadAsync(input, { base64: false, optimizedBinaryString: true })
  const data = await zip.file(Object.getOwnPropertyNames(zip['files'])[0]).async('string');

  return new DOMParser().parseFromString(data, 'text/xml');
};

export const convertZIPGEOJSON = async (input) => {
  if (!input) return;

  const zip = await JSZip.loadAsync(input, { base64: false, optimizedBinaryString: true })
  const data = await zip.file(Object.getOwnPropertyNames(zip['files'])[0]).async('string');

  return data;
};

export const convertKMLGEOJSON = async (input) => {
  if (!input) return { features: [] };

  return togeojson.kml(input);
};

export const convertZIPGEOJSONParse = async (input) => {
  if (!input) return { features: [] };

  return JSON.parse(input);
};
