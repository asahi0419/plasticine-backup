import getTableResolver from '../../table-resolver/index.js';

function resolver () {
  const tableResolver = getTableResolver();
  return (model) => tableResolver.resolve(model);
}

export default resolver();
