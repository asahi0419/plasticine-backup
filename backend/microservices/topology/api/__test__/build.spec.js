import { buildData } from '../index.js';

const { manager } = h.record;

beforeAll(async () => {
  t.models = {
    self: await manager('model').create(),
    parent: await manager('model').create(),
    edge_links: await manager('model').create(),
  };

  t.fields = {
    self: {
      array_string: await manager('field').create({ model: t.models.self.id, type: 'array_string', options: '{"values":{"first":"First","second":"Second","third":"Third"}}' }),
      reference: await manager('field').create({ model: t.models.self.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.parent.alias, view: 'default', foreign_label: 'id' }) }),
    },
    edge_links: {
      reference1: await manager('field').create({ model: t.models.edge_links.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.self.alias, view: 'default', foreign_label: 'id' }) }),
      reference2: await manager('field').create({ model: t.models.edge_links.id, type: 'reference', options: JSON.stringify({ foreign_model: t.models.parent.alias, view: 'default', foreign_label: 'id' }) }),  
    }
  };

  t.records = {};
  t.records.parent = {
    record1: await manager(t.models.parent.alias).create(),
  };
  t.records.self = {
    record2: await manager(t.models.self.alias).create({ [t.fields.self.array_string.alias]: 'second' }),
    record3: await manager(t.models.self.alias).create({
      [t.fields.self.array_string.alias]: 'first',
      [t.fields.self.reference.alias]: t.records.parent.record1.id
    }),
  };
  t.records.edge_links = {
    record4: await manager(t.models.edge_links.alias).create({
      [t.fields.edge_links.reference1.alias]: t.records.self.record3.id,
      [t.fields.edge_links.reference2.alias]: t.records.parent.record1.id
    }),
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('build', () => {
  it('When "target" type with filter, should return one node', async () => {
    const inJson = {
      [t.models.self.alias]: {
          "filter":`\`${t.fields.self.array_string.alias}\` IN ('first')`,
          "type": "target",
          "label": `label_{{${t.fields.self.array_string.alias}}}` 
      }
    };

    const result = {
      "id": "gr0",
      "properties": {},
      "nodes": [
        {
          "id": `${t.models.self.id}/${t.records.self.record3.id}`,
          "ref": {
            [t.models.self.id]: t.records.self.record3.id
          },
          "properties": {
            "text": {
              "label": "label_first"
            }
          }
        }
      ],
      "edges": []
    };

    const graph = await buildData(inJson);
    expect(graph).toEqual(result);
  });

  it('When "source" type with filter, should return 2 nodes with edge', async () => {
    const inJson = {
      [t.models.self.alias]: {
          "filter":`\`${t.fields.self.array_string.alias}\` IN ('first')`,
          "type": "source",
          "label": `label_{{${t.fields.self.array_string.alias}}}`,
          "source": {
            "ref": t.fields.self.reference.alias,
            "label": 'label'
          }
      }
    };

    const result = {
      "id": "gr0",
      "properties": {},
      "nodes": [
        {
          "id": `${t.models.self.id}/${t.records.self.record3.id}`,
          "ref": {
            [t.models.self.id]: t.records.self.record3.id
          },
          "properties": {
            "text": {
              "label": "label_first"
            }
          }
        },
        {
          "id": `${t.models.parent.id}/${t.records.parent.record1.id}`,
          "ref": {
            [t.models.parent.id]: t.records.parent.record1.id
          },
          "properties": {
            "text": {
              "label": "label"
            }
          }
        }
      ],
      "edges": [
        {
          "id": `${t.models.parent.id}/${t.records.parent.record1.id}-${t.models.self.id}/${t.records.self.record3.id}`,
          "properties": {
            "source": `${t.models.parent.id}/${t.records.parent.record1.id}`,
            "target": `${t.models.self.id}/${t.records.self.record3.id}`,
            "text": {
              "label": "label - label_first"
            }
          }
        }
      ]
    };

    const graph = await buildData(inJson);
    expect(graph).toEqual(result);
  });

  it('When "edge" type, should return only edge', async () => {
    const inJson = {
      [t.models.edge_links.alias]: {
          "type": "edge",
          "source": {
            "ref": t.fields.edge_links.reference1.alias,
            "label": 'label_source'
          },
          "target": {
            "ref": t.fields.edge_links.reference2.alias,
            "label": 'label_target'
          }
      }
    };

    const result = {
      "id": "gr0",
      "properties": {},
      "nodes": [],
      "edges": [
        {
          "id": `${t.models.self.id}/${t.records.self.record3.id}-${t.models.parent.id}/${t.records.parent.record1.id}`,
          "properties": {
            "source": `${t.models.self.id}/${t.records.self.record3.id}`,
            "target": `${t.models.parent.id}/${t.records.parent.record1.id}`,
            "text": {
              "label": "label_source - label_target"
            }
          }
        }
      ]
    };

    const graph = await buildData(inJson);
    expect(graph).toEqual(result);
  });
});
