export const APPLICATORS = {
  columns: '__applyColumns',
  froms: '__applyFroms',
  finders: '__applyFinders',
  agregates: '__applyAgregates',
  groupings: '__applyGroupings',
  joins: '__applyJoins',
  serviceJoins: '__applyServiceJoins',
  orderings: '__applyOrderings',
  limiter: '__applyLimiter',
  offset: '__applyOffset',
  chain: '__applyChain',
  updaters: '__applyUpdaters',
};

export const COUNT_APPLICATORS = ['froms', 'finders', 'serviceJoins', 'joins', 'limiter', 'offset', 'chain', 'updaters'];
export const DISTINCT_APPLICATORS = ['froms', 'finders', 'serviceJoins', 'joins', 'limiter', 'offset'];
export const DELETE_APPLICATORS = ['froms', 'finders', 'serviceJoins', 'joins', 'chain'];
