export default async (model, properties, appearance = {}) => {
  const { options = {} } = appearance;
  const { geojson } = options;

  const result = [];

  if (geojson) {
    result.push({
      section: {
        name: 'Import (geojson)',
        items: geojson.features.map((feature, i) => {
          return {
            key: `${i + 1} ${feature.geometry.type}`,
            geo: feature.properties,
            geometry: feature.geometry
          };
        }),
      }
    });
  }

  return result;
}