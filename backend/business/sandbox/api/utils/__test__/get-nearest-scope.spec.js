import QueryBuilder from '../../query/builder.js';
import getNearestScopeFunction from '../get-nearest-scope/index.js';
import { getDistanceScope } from '../get-nearest-scope/helpers.js';

describe('Sandbox', () => {
  describe('utils.getNearestScope(modelAlias, lat, lon, radius)', () => {
    it('Should return nearest scope', async () => {
      const getNearestScope = getNearestScopeFunction(sandbox);

      const modelAlias = 'model';
      const lat = 0;
      const lon = 0;
      const radius = 10;

      const modelBuilder = db.model(modelAlias);
      const scope = getDistanceScope(modelBuilder, lat, lon, radius);

      const result = getNearestScope(modelAlias, lat, lon, radius);

      expect(result).toBeInstanceOf(QueryBuilder);
      expect(result.model).toEqual(db.getModel(modelAlias));
      expect(result.selectorScope.scope.clauses[0].args.sql).toEqual(scope.clauses[0].args.sql);
    });
  });
});
