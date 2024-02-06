import Fetcher from './index.js';

export default (model, originalFetcher, params) => {
  params.fields = originalFetcher.params.fields;
  return new Fetcher(model, originalFetcher.sandbox, params);
};
