import { isPlainObject } from '../../../../helpers/index.js';
import { errorHandler } from '../../../../error/express.js';
import { getErrorWrapper, checkScriptErrorType } from './helpers.js';

export default class ResponseProxy {
  constructor(response, request) {
    this.response = response;
    this.request = request;
  }

  json(payload) {
    this.response.status(200).json(payload);
  }

  error(error = {}) {
    const stack = isPlainObject(error.stack) ? JSON.stringify(error.stack) : (error.stack || '');
    const type = checkScriptErrorType(stack.split('\n'));
    const ErrorWrapper = getErrorWrapper(error, type);
    const wrappedError = ErrorWrapper ? new ErrorWrapper((error.description || stack), stack) : error;

    errorHandler(wrappedError, this.request, this.response);
  }
}
