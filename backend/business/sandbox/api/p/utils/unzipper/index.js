import unzipper from 'unzipper'
import request from 'request'

import logger from '../../../../../logger/index.js'
import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => async (source, params = {}) => {
  if (!source) throw new ParamsNotValidError(`Cannot get buffer from 'source' in p.utils.unzipper(...)`)
  
  try {
    if (typeof source === 'string') {
      return unzipper.Open.url(request, {
        method: 'get',
        url: source,
        ...params
      })
    } else {
      const buffer = await source.getBuffer()
      if (!buffer) throw new ParamsNotValidError(`Cannot get buffer from 'source' in p.utils.unzipper(...)`)

      return unzipper.Open.buffer(buffer)
    }
  } catch (error) {
    logger.error(new ParamsNotValidError(`Cannot unzip files in p.utils.unzipper(...)
    ${error}`))
  }
}