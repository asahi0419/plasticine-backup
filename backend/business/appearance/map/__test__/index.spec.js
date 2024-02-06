import processMapAppearance from '../index.js';

const { manager } = h.record;

describe('Appearance', () => {
  describe('Map', () => {
    it('Should return feature groups', async () => {
      const model = await manager('model').create();

      await manager('field').create({ model: model.id, type: 'string', alias: 'name' });
      await manager('field').create({ model: model.id, type: 'float', alias: 'p_lon' });
      await manager('field').create({ model: model.id, type: 'float', alias: 'p_lat' });

      await manager(model.alias).create({ name: 'Group 1', p_lon: 0, p_lat: 0 });
      await manager(model.alias).create({ name: 'Group 2', p_lon: 0, p_lat: 0 });

      const appearance = await manager('appearance').create({
        model: model.id,
        type: 'map',
        script: `async function(scope) {
          const result = await scope.find({});
          const grouped = lodash.groupBy(result, (record) => record.getValue('name'));

          return lodash.map(grouped, (record, key) => {
            const records = lodash.map(record, ({ attributes }) => attributes);
            return { key, records };
          });
        }`,
      });

      const result = await processMapAppearance(appearance, model, {}, sandbox);
      const expected = {
        type: 'FeatureCollection',
        features: [
          {
            id: 1,
            type: "Feature",
            geometry: {
              coordinates: [0, 0],
              type: "Point"
            },
            properties: {
              "marker-color": "#0000ff",
              "marker-opacity": 1,
              "marker-size": "medium",
              "marker-symbol": "circle",
              "p-name": "Group 1",
              "p-show-on-legend": true
            },
          },
          {
            id: 2,
            type: "Feature",
            geometry: {
              coordinates: [0, 0],
              type: "Point"
            },
            properties: {
              "marker-color": "#0000ff",
              "marker-opacity": 1,
              "marker-size": "medium",
              "marker-symbol": "circle",
              "p-name": "Group 2",
              "p-show-on-legend": true
            },
          }
        ],
      };

      expect(result).toMatchObject(expected);
    });
  });
});
