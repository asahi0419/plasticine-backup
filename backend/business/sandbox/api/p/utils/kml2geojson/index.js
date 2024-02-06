import * as tj from '@tmcw/togeojson'
import { DOMParser } from '@xmldom/xmldom'

import logger from '../../../../../logger/index.js'
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => (string) => {
  try {
    const kml = new DOMParser().parseFromString(string)

    return tj.kml(kml)
  } catch (error) {
    logger.error(new ParamsNotValidError(`Parameter 'string' is not valid in p.utils.kml2geojson(...)
${error}`))
  }
}
