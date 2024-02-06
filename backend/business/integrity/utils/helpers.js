import * as PERFORMERS from '../performers/index.js';

export const createPerformer = (modelAlias, record, sandbox) => {
  const Performer = PERFORMERS[modelAlias] || PERFORMERS['base'];
  return new Performer(modelAlias, record, sandbox);
};

export const getAliasPattern = alias => `(['"\`({])${alias}`;

export const getForeignModelPattern = alias => `"foreign_model":"${alias}"|"model":"${alias}"`;

export const getForeignLabelPattern = alias => `"foreign_label":"(${alias}|{${alias}})"`;
