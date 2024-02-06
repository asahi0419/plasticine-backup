import getAgent from './agent.js';

export default () => ({
  Agent: (...args) => getAgent(...args),
});
