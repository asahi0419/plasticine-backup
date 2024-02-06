import generate from './generate/index.js';

export default {
  create: generate('release'),
  changes: generate('changes'),
};
