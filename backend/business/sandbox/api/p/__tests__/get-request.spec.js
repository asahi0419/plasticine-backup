import getRequest from '../get-request';
import ModelProxy from '../../model';

const { manager } = h.record;

beforeAll(async () => {
  t.model = await manager('model').create();

  await manager('field').create({ model: t.model.id, type: 'array_string',      alias: 'array_string'      });
  await manager('field').create({ model: t.model.id, type: 'string',            alias: 'string'            });
  await manager('field').create({ model: t.model.id, type: 'fa_icon',           alias: 'fa_icon'           });
  await manager('field').create({ model: t.model.id, type: 'file',              alias: 'file'              });
  await manager('field').create({ model: t.model.id, type: 'data_template',     alias: 'data_template'     });
  await manager('field').create({ model: t.model.id, type: 'data_visual',       alias: 'data_visual'       });
  await manager('field').create({ model: t.model.id, type: 'condition',         alias: 'condition'         });
  await manager('field').create({ model: t.model.id, type: 'integer',           alias: 'integer'           });
  await manager('field').create({ model: t.model.id, type: 'float',             alias: 'float'             });
  await manager('field').create({ model: t.model.id, type: 'boolean',           alias: 'boolean'           });
  await manager('field').create({ model: t.model.id, type: 'datetime',          alias: 'datetime'          });
  await manager('field').create({ model: t.model.id, type: 'reference',         alias: 'reference',         options: '{"foreign_model":"model","foreign_label":"name"}'    });
  await manager('field').create({ model: t.model.id, type: 'reference_to_list', alias: 'reference_to_list', options: '{"foreign_model":"model","foreign_label":"name"}'    });
  await manager('field').create({ model: t.model.id, type: 'global_reference',  alias: 'global_reference',  options: '[{"model":"model","view":"default","label":"name"}]' });
});

describe('p.getRequest', () => {
  it('Should return correct object', () => {
    let request;
    let result = getRequest({})();
    expect(result).toEqual({});

    request = { params: { paramsKey: 'value' }, query: { queryKey: 'value' }, body: { bodyKey: 'value' } };
    result = getRequest({ request })();

    expect(result.paramsKey).toEqual(request.params.paramsKey);
    expect(result.queryKey).toEqual(request.query.queryKey);
    expect(result.bodyKey).toEqual(request.body.bodyKey);

    request = { model: { alias: 'alias' } };
    result = getRequest({ request })();

    expect(result.modelAlias).toEqual(request.model.alias);

    request = {};
    result = getRequest({ request })();

    expect(result.exec_by).toEqual({});

    request = { headers: { client: 'mobile' } };
    result = getRequest({ request })();

    expect(result.client).toEqual(request.headers.client);

    request = { params: { alt: 'alt', lat: 'lat', lon: 'lon' } };
    result = getRequest({ request })();

    expect(result.gps.alt).toEqual(request.params.alt);
    expect(result.gps.lat).toEqual(request.params.lat);
    expect(result.gps.lon).toEqual(request.params.lon);

    request = { cookies: 'cookies', headers: 'headers' };
    result = getRequest({ request })();

    expect(result.__cookies).toEqual(request.cookies);
    expect(result.__headers).toEqual(request.headers);

    request = { ip: 'ip', hostname: 'hostname', method: 'method', protocol: 'protocol' };
    result = getRequest({ request })();

    expect(result.__meta.ip).toEqual(request.ip);
    expect(result.__meta.hostname).toEqual(request.hostname);
    expect(result.__meta.method).toEqual(request.method);
    expect(result.__meta.protocol).toEqual(request.protocol);
  });

  describe('getRecord()', () => {
    it('Should return record proxy', async () => {
      let request, result;

      request = { sandbox };
      result = getRequest({ request })();

      expect(await result.getRecord()).toEqual(null);

      request = {
        sandbox,
        model: { id: 1 },
        params: { record: { id: 1 } },
        modelProxy: new ModelProxy({ id: 1 }, sandbox)
      };
      result = getRequest({ request })();

      const record = await result.getRecord();
      expect(record.constructor.name).toEqual('RecordProxy');
      expect(record.getValue('id')).toEqual(request.params.record.id);
      // should preload data
      expect(record.getVisibleValue('created_by')).toEqual('System Administrator');
    });
  });

  describe('getAttributesFromFilter(params)', () => {
    describe('Plain:', () => {
      it('Should return filter object from hidden filter', async () => {
        const test = { hidden_filter: `
          (\`array_string\`      = 'test'                    ) AND
          (\`string\`            = 'test'                    ) AND
          (\`fa_icon\`           = 'test'                    ) AND
          (\`file\`              = 'test'                    ) AND
          (\`data_template\`     = 'test'                    ) AND
          (\`data_visual\`       = 'test'                    ) AND
          (\`condition\`         = 'test'                    ) AND
          (\`integer\`           = 1                         ) AND
          (\`float\`             = 1.2                       ) AND
          (\`boolean\`           = true                      ) AND
          (\`datetime\`          = '2019-02-21T18:48:24.350Z') AND
          (\`reference\`         = 1                         ) AND
          (\`reference_to_list\` = (1, 2)                    ) AND
          (\`global_reference\`  = 1                         )
        `};
        const expected = {
          array_string:      'test',
          string:            'test',
          fa_icon:           'test',
          file:              'test',
          data_template:     'test',
          data_visual:       'test',
          condition:         'test',
          integer:           1,
          float:             1.2,
          boolean:           true,
          datetime:          '2019-02-21T18:48:24.350Z',
          reference:         1,
          reference_to_list: [1, 2],
          global_reference:  1,
        };

        const request = getRequest({ request: { sandbox, model: t.model, body: { viewOptions: test } } });
        const result = await request().getAttributesFromFilter();

        expect(result).toEqual(expected);
      });
      it('Should include filter part if param "only_hidden" is set to false', async () => {
        const test = { hidden_filter: "`string` = 'test'", filter: 'id = 1' };
        const expected = { id: 1, string: 'test' };
        const request = getRequest({ request: { sandbox, model: t.model, body: { viewOptions: test } } });
        const result = await request().getAttributesFromFilter({ only_hidden: false });

        expect(result).toEqual(expected);
      });
      it('Should include filter part if request model is core', async () => {
        const test = { hidden_filter: "`alias` = 'model'", filter: 'id = 1' };
        const expected = { id: 1, alias: 'model' };
        const request = getRequest({ request: { sandbox, model: db.getModel('model'), body: { viewOptions: test } } });
        const result = await request().getAttributesFromFilter();

        expect(result).toEqual(expected);
      });
    })
    describe('JS:', () => {
      it('Should return filter object', async () => {
        const test = { hidden_filter: "`id` = 'js:p.currentUser.getValue(\"id\")'" };
        const expected = { id: 1 };
        const request = getRequest({ request: { sandbox, model: t.model, body: { viewOptions: test } } });
        const result = await request().getAttributesFromFilter();

        expect(result).toEqual(expected);
      });
      it('Should return filter object from filter with invalid values', async () => {
        const test = { hidden_filter: `
          (\`array_string\`      = 'js:not "true"') AND
          (\`string\`            = 'js:not "true"') AND
          (\`fa_icon\`           = 'js:not "true"') AND
          (\`file\`              = 'js:not "true"') AND
          (\`data_template\`     = 'js:not "true"') AND
          (\`data_visual\`       = 'js:not "true"') AND
          (\`condition\`         = 'js:not "true"') AND
          (\`integer\`           = 'js:not "true"') AND
          (\`float\`             = 'js:not "true"') AND
          (\`boolean\`           = 'js:not "true"') AND
          (\`datetime\`          = 'js:not "true"') AND
          (\`reference\`         = 'js:not "true"') AND
          (\`reference_to_list\` = 'js:not "true"') AND
          (\`global_reference\`  = 'js:not "true"')
        `};
        const expected = {
          string:            undefined,
          fa_icon:           undefined,
          file:              undefined,
          data_template:     undefined,
          data_visual:       undefined,
          condition:         undefined,
          integer:           undefined,
          float:             undefined,
          boolean:           undefined,
          array_string:      undefined,
          datetime:          undefined,
          reference:         undefined,
          reference_to_list: undefined,
          global_reference:  undefined,
        };

        const request = getRequest({ request: { sandbox, model: t.model, body: { viewOptions: test } } });
        const result = await request().getAttributesFromFilter();

        expect(result).toEqual(expected);
      });
    });
  });
});
