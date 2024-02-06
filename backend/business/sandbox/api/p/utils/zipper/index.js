import Zip from 'pizzip'
import lodash from 'lodash-es'

import { ParamsNotValidError } from '../../../../../error/index.js';

export default (sandbox) => async (input, params = { type: 'nodebuffer' }) => {
  const zip = new Zip();

  if (lodash.isArray(input)) {
    lodash.each(input, (i) => zip.file(i.name, i.data))
  } else if (lodash.isObject(input)) {
    zip.file(input.name, input.data)
  } else {
    throw new ParamsNotValidError(`p.utils.zipper(...): input should be an Object or an Array { name:  }`)
  }

  return zip.generate(params)
}