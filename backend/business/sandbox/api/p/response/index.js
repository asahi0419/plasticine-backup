import ResponseProxy from './proxy.js';

export default ({ request, response }) => new ResponseProxy(response, request);
