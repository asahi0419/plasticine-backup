import moment from 'moment';

const { record, selector } = h;
const { manager } = record;

const createTCross = async (attributes) => {
  t.dvf_record = await manager(t.dvf_model.alias).create();
  t.data_record = await manager(t.data_model.alias).create(attributes);

  t.dvf_t_cross = await manager('t_cross').create({
    dtf_field_id: t.dtf_field.id,
    dtf_record_id: t.dtf_record.id,
    data_model_id: t.data_model.id,
    dvf_field_id: t.dvf_field.id,
    data_record_id: t.dvf_record.id,
    dvf_record_id: t.data_record.id,
  });
};

const processTCase = async (attributes, filter) => {
  await createTCross(attributes);
  const [{ id }] = await selector(t.dvf_model.alias).fetch(filter);
  await manager(t.dvf_model.alias).destroy({ id });

  expect(id).toEqual(t.dvf_record.id);
}

beforeAll(async () => {
  t.datetime = moment().format();

  t.dtf_model = await manager('model').create();
  t.dtf_field = await manager('field').create({ model: t.dtf_model.id, type: 'data_template' });
  t.dtf_record = await manager(t.dtf_model.alias).create();

  t.dvf_model = await manager('model').create();
  t.dvf_field = await manager('field').create({ model: t.dvf_model.id, type: 'data_visual' });

  t.t_cross = await db.model('t_cross').where({ dtf_field_id: t.dtf_field.id }).getOne();
  t.data_model = await db.model('model').where({ data_template: t.t_cross.id }).getOne();

  t.array_string_field = await manager('field').create({ model: t.data_model.id, type: 'array_string', options: '{"values":{"one":"One","two":"Two"}}' });
  t.datetime_field = await manager('field').create({ model: t.data_model.id, type: 'datetime' });
  t.float_field = await manager('field').create({ model: t.data_model.id, type: 'float' });

  t.columns = {};
  t.columns.array_string = `\`__dvf__${t.dvf_field.alias}/${t.dtf_field.alias}/${t.data_model.id}/${t.array_string_field.alias}\``;
  t.columns.datetime =     `\`__dvf__${t.dvf_field.alias}/${t.dtf_field.alias}/${t.data_model.id}/${t.datetime_field.alias}\``;
  t.columns.float =        `\`__dvf__${t.dvf_field.alias}/${t.dtf_field.alias}/${t.data_model.id}/${t.float_field.alias}\``;

  t.array_string_alias = t.array_string_field.alias;
  t.datetime_alias = t.datetime_field.alias;
  t.float_alias = t.float_field.alias;
});

describe('Filter: Common cases [Template fields]', () => {
  it(`Should filter scope by template field [is]`,                 () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} = 'one'`));
  it(`Should filter scope by template field [is not]`,             () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} != 'two'`));
  it(`Should filter scope by template field [is empty]`,           () => processTCase({                               }, `${t.columns.array_string} IS NULL`));
  it(`Should filter scope by template field [is not empty]`,       () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} IS NOT NULL`));
  it(`Should filter scope by template field [in]`,                 () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} IN ('one')`));
  it(`Should filter scope by template field [not in]`,             () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} NOT IN ('two')`));
  it(`Should filter scope by template field [starts with]`,        () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} LIKE 'on%'`));
  it(`Should filter scope by template field [ends with]`,          () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} LIKE '%ne'`));
  it(`Should filter scope by template field [contains]`,           () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} LIKE '%on%'`));
  it(`Should filter scope by template field [does not contain]`,   () => processTCase({ [t.array_string_alias]: 'one' }, `${t.columns.array_string} NOT LIKE '%tw%'`));

  it(`Should filter scope by template field [on]`,                 () => processTCase({ [t.datetime_alias]: t.datetime }, `${t.columns.datetime} = '${t.datetime}'`));
  it(`Should filter scope by template field [not on]`,             () => processTCase({ [t.datetime_alias]: t.datetime }, `${t.columns.datetime} != '${moment().format()}'`));
  it(`Should filter scope by template field [before]`,             () => processTCase({ [t.datetime_alias]: t.datetime }, `${t.columns.datetime} < '${moment().format()}'`));
  it(`Should filter scope by template field [before on]`,          () => processTCase({ [t.datetime_alias]: t.datetime }, `${t.columns.datetime} <= '${moment().format()}'`));
  it(`Should filter scope by template field [after]`,              () => processTCase({ [t.datetime_alias]: moment().format() }, `${t.columns.datetime} > '${t.datetime}'`));
  it(`Should filter scope by template field [after on]`,           () => processTCase({ [t.datetime_alias]: moment().format() }, `${t.columns.datetime} >= '${t.datetime}'`));
  it(`Should filter scope by template field [between]`,            () => processTCase({ [t.datetime_alias]: moment().format() }, `${t.columns.datetime} BETWEEN '${t.datetime}' AND '${moment().format()}'`));

  it(`Should filter scope by template field [less than]`,          () => processTCase({ [t.float_alias]: 1.2 }, `${t.columns.float} < 1.3`));
  it(`Should filter scope by template field [less than or is]`,    () => processTCase({ [t.float_alias]: 1.2 }, `${t.columns.float} <= 1.3`));
  it(`Should filter scope by template field [greater than]`,       () => processTCase({ [t.float_alias]: 1.2 }, `${t.columns.float} > 1.1`));
  it(`Should filter scope by template field [greater than or is]`, () => processTCase({ [t.float_alias]: 1.2 }, `${t.columns.float} >= 1.1`));

  it(`Should filter scope by template fields with OR query`,       () => processTCase({ [t.float_alias]: 1.2 }, `(${t.columns.float} >= 1.1) OR (${t.columns.float} >= 1.1)`));
});
