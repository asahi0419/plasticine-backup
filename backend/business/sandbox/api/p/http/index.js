import getApi from './api/index.js';
import getRequest from './request/index.js';

export default () => ({
  ...getApi(),
  ...getRequest(),
});
