import classifyPointFunction from './classifyPoint.js';

export default (sandbox) => {
  return {
    classifyPoint: classifyPointFunction(sandbox),
  };
};
