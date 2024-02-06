import { map, find } from 'lodash-es';

import Fetcher from '../fetcher/index.js';

const { manager } = h.record;

describe('Record: Fetcher', () => {
  it('Should fetch extra attributes for reference fields', async () => {
    const model1 = await manager('model').create();
    const model2 = await manager('model').create();

    const extraField = await db.model('field').where({ model: model1.id, alias: 'id' }).getOne();
    const field1 = await manager('field').create({ model: model2.id, type: 'reference', options: `{"foreign_model":"${model1.alias}","foreign_label":"id","extra_fields":["${extraField.alias}"]}` });
    const field2 = await manager('field').create({ model: model2.id, type: 'reference', options: `{"foreign_model":"${model1.alias}","foreign_label":"id","extra_fields":[${extraField.id}]}` });

    const record = await manager(model1.alias).create();
    await manager(model2.alias).create({
      [field1.alias]: record[extraField.alias],
      [field2.alias]: record[extraField.alias],
    });

    const { records = [] } = await new Fetcher(model2, sandbox, { load_extra_fields: true }).fetch();
    const [ fetchedRecord = {} ] = records;
    const { __extraAttributes: result } = fetchedRecord;

    expect(result[field1.alias][extraField.alias]).toEqual(record[extraField.alias]);
    expect(result[field2.alias][extraField.alias]).toEqual(record[extraField.alias]);
  });

  it('Should fetch records sorted by multiple fields', async () => {
    const model1 = await manager('model').create();
    const model2 = await manager('model').create();

    const fr1 = await manager(model2.alias).create();
    const fr2 = await manager(model2.alias).create();

    const field1 = await manager('field').create({ model: model1.id, type: 'reference', options: `{"foreign_model":"${model2.alias}","foreign_label":"id"}` });
    const field2 = await manager('field').create({ model: model1.id, type: 'reference', options: `{"foreign_model":"${model2.alias}","foreign_label":"id"}` });

    await manager(model1.alias).create({ [field1.alias]: 1, [field2.alias]: 2 });
    await manager(model1.alias).create({ [field1.alias]: 2, [field2.alias]: 1 });

    const { records: result1 = [] } = await new Fetcher(model1, sandbox, { sort: `${field1.alias},-${field2.alias}` }).fetch();

    expect(map(result1, field1.alias)).toEqual([1, 2]);
    expect(map(result1, field2.alias)).toEqual([2, 1]);

    const { records: result2 = [] } = await new Fetcher(model1, sandbox, { sort: `-${field1.alias},${field2.alias}` }).fetch();

    expect(map(result2, field1.alias)).toEqual([2, 1]);
    expect(map(result2, field2.alias)).toEqual([1, 2]);
  });

  it('Should fetch records sorted by multiple reference fields (the same foreign)', async () => {
    const model = await manager('model').create();
    const field1 = await manager('field').create({ model: model.id, type: 'boolean' });
    const field2 = await manager('field').create({ model: model.id, type: 'integer' });
    const field3 = await manager('field').create({ model: model.id, type: 'array_string', options: '{"values":{"1":"1","2":"2"}}' });

    await manager(model.alias).create({ [field1.alias]: false, [field2.alias]: 30, [field3.alias]: '1' });
    await manager(model.alias).create({ [field1.alias]: true,  [field2.alias]: 10, [field3.alias]: '1' });
    await manager(model.alias).create({ [field1.alias]: false, [field2.alias]: 20, [field3.alias]: '1' });
    await manager(model.alias).create({ [field1.alias]: true,  [field2.alias]: 5,  [field3.alias]: '2' });

    const { records: result1 = [] } = await new Fetcher(model, sandbox, { sort: `${field1.alias},${field2.alias}` }).fetch();

    expect(map(result1, field1.alias)).toEqual([false, false, true, true]);
    expect(map(result1, field2.alias)).toEqual([20, 30, 5, 10]);

    const { records: result2 = [] } = await new Fetcher(model, sandbox, { sort: `-${field2.alias},${field3.alias}` }).fetch();

    expect(map(result2, field2.alias)).toEqual([30, 20, 10, 5]);
    expect(map(result2, field3.alias)).toEqual(['1', '1', '1', '2']);
  });

  it('Should fetch records sorted by multiselect array_string field', async () => {
    const model = await manager('model').create();
    const field = await manager('field').create({ model: model.id, type: 'array_string', options: '{"values":{"1":"1","2":"2"},"multi_select":true}' });

    await manager(model.alias).create({ [field.alias]: '1' });
    await manager(model.alias).create({ [field.alias]: '1,2' });
    await manager(model.alias).create({ [field.alias]: '2' });
    await manager(model.alias).create({ [field.alias]: '2,1' });

    const { records: result1 = [] } = await new Fetcher(model, sandbox, { sort: `${field.alias}` }).fetch();
    expect(map(result1, field.alias)).toEqual([['1'], ['1','2'], ['1','2'], ['2']]);

    const { records: result2 = [] } = await new Fetcher(model, sandbox, { sort: `-${field.alias}` }).fetch();
    expect(map(result2, field.alias)).toEqual([['2'], ['1','2'], ['1','2'], ['1']]);
  });

  it('Should fetch records sorted by rtl field', async () => {
    const model1 = await manager('model').create();
    const model2 = await manager('model').create();

    const field1 = await manager('field').create({ model: model1.id, type: 'reference_to_list', options: `{"foreign_model":"${model2.alias}","foreign_label":"id"}` });
    const field2 = await manager('field').create({ model: model1.id, type: 'reference_to_list', options: `{"foreign_model":"${model2.alias}","foreign_label":"{id}-{created_by}"}` });

    const fr1 = await manager(model2.alias).create();
    const fr2 = await manager(model2.alias).create();

    await manager(model1.alias).create({ [field1.alias]: [fr1.id],         [field2.alias]: [fr1.id] });
    await manager(model1.alias).create({ [field1.alias]: [fr1.id, fr2.id], [field2.alias]: [fr1.id, fr2.id] });
    await manager(model1.alias).create({ [field1.alias]: [fr2.id],         [field2.alias]: [fr2.id] });
    await manager(model1.alias).create({ [field1.alias]: [fr2.id, fr1.id], [field2.alias]: [fr2.id, fr1.id] });

    // label - plain
    const { records: result1 = [] } = await new Fetcher(model1, sandbox, { sort: `${field1.alias}`, full_fieldset: true }).fetch();
    expect(map(result1, field1.alias)).toEqual([[fr1.id], [fr1.id, fr2.id], [fr2.id], [fr2.id, fr1.id]]);
    const { records: result2 = [] } = await new Fetcher(model1, sandbox, { sort: `-${field1.alias}`, full_fieldset: true }).fetch();
    expect(map(result2, field1.alias)).toEqual([[fr2.id, fr1.id], [fr2.id], [fr1.id, fr2.id], [fr1.id]]);

    // label - pattern
    const { records: result3 = [] } = await new Fetcher(model1, sandbox, { sort: `${field2.alias}`, full_fieldset: true }).fetch();
    expect(map(result3, field2.alias)).toEqual([[fr1.id], [fr1.id, fr2.id], [fr2.id], [fr2.id, fr1.id]]);
    const { records: result4 = [] } = await new Fetcher(model1, sandbox, { sort: `-${field2.alias}`, full_fieldset: true }).fetch();
    expect(map(result4, field2.alias)).toEqual([[fr2.id, fr1.id], [fr2.id], [fr1.id, fr2.id], [fr1.id]]);
  });


  it('Should fetch records sorted by GREATEST([datetime], [datetime]) and LEAST([datetime], [datetime) function', async () => {
    const model1 = await manager('model').create();

    const field1 = await manager('field').create({ model: model1.id, type: 'datetime'});
    const field2 = await manager('field').create({ model: model1.id, type: 'datetime'});

    if(!find(sandbox.user.__privileges, {model_id:model1.id})){
      const [privilege] =  await db.model('privilege').where({model:model1.id});
      sandbox.user.__privileges.push({model_id: privilege.model, model_alias:null, level:privilege.level, owner_type: privilege.owner_type, id:privilege.id})
    }

    const record1 = await manager(model1.alias).create({[field1.alias]:new Date('2000-01-01 00:00:10'), [field2.alias]:new Date('2000-01-01 00:01:10')});
    const record2 = await manager(model1.alias).create({[field1.alias]:new Date('2000-01-01 00:00:20'), [field2.alias]:new Date('2000-01-01 00:00:30')});
    const record3 = await manager(model1.alias).create({[field1.alias]:new Date('2000-01-01 00:00:21'), [field2.alias]:new Date('2000-01-01 00:00:25')});
    const record4 = await manager(model1.alias).create({[field1.alias]:new Date('2000-01-01 00:00:40'), [field2.alias]:new Date('2000-01-01 00:01:00')});

    const { records = [] } = await new Fetcher(model1, sandbox, { sort:`->${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records, record=>record.id)).toEqual([record1.id, record4.id, record2.id, record3.id]);

    const { records: records1 = [] } = await new Fetcher(model1, sandbox, { sort:`>${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records1, record=>record.id)).toEqual([record3.id, record2.id, record4.id, record1.id]);

    const { records: records2 = [] } = await new Fetcher(model1, sandbox, { sort:`-<${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records2, record=>record.id)).toEqual([record4.id, record3.id, record2.id, record1.id]);

    const { records: records3 = [] } = await new Fetcher(model1, sandbox, { sort:`<${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records3, record=>record.id)).toEqual([record1.id, record2.id, record3.id, record4.id]);
  });

  it('Should fetch records sorted by GREATEST([string], [string]) and LEAST([string], [string]) function', async () => {
    const model1 = await manager('model').create();

    const field1 = await manager('field').create({ model: model1.id, type: 'string'});
    const field2 = await manager('field').create({ model: model1.id, type: 'string'});

    if(!find(sandbox.user.__privileges, {model_id:model1.id})){
      const [privilege] =  await db.model('privilege').where({model:model1.id});
      sandbox.user.__privileges.push({model_id: privilege.model, model_alias:null, level:privilege.level, owner_type: privilege.owner_type, id:privilege.id})
    }

    const record1 = await manager(model1.alias).create({[field1.alias]:'a', [field2.alias]:'z'});
    const record2 = await manager(model1.alias).create({[field1.alias]:'c', [field2.alias]:'i'});
    const record3 = await manager(model1.alias).create({[field1.alias]:'b', [field2.alias]:'d'});
    const record4 = await manager(model1.alias).create({[field1.alias]:'f', [field2.alias]:'j'});

    const { records = [] } = await new Fetcher(model1, sandbox, { sort:`->${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records, record=>record.id)).toEqual([record1.id, record4.id, record2.id, record3.id]);

    const { records: records1 = [] } = await new Fetcher(model1, sandbox, { sort:`>${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records1, record=>record.id)).toEqual([record3.id, record2.id, record4.id, record1.id]);

    const { records: records2 = [] } = await new Fetcher(model1, sandbox, { sort:`-<${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records2, record=>record.id)).toEqual([record4.id, record2.id, record3.id, record1.id]);

    const { records: records3 = [] } = await new Fetcher(model1, sandbox, { sort:`<${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records3, record=>record.id)).toEqual([record1.id, record3.id, record2.id, record4.id]);
  });

  it('Should fetch records sorted by GREATEST([integer], [integer]) and LEAST([integer], [integer]) function', async () => {
    const model1 = await manager('model').create();

    const field1 = await manager('field').create({ model: model1.id, type: 'string'});
    const field2 = await manager('field').create({ model: model1.id, type: 'string'});

    if(!find(sandbox.user.__privileges, {model_id:model1.id})){
      const [privilege] =  await db.model('privilege').where({model:model1.id});
      sandbox.user.__privileges.push({model_id: privilege.model, model_alias:null, level:privilege.level, owner_type: privilege.owner_type, id:privilege.id})
    }

    const record1 = await manager(model1.alias).create({[field1.alias]:1, [field2.alias]:8});
    const record2 = await manager(model1.alias).create({[field1.alias]:3, [field2.alias]:5});
    const record3 = await manager(model1.alias).create({[field1.alias]:2, [field2.alias]:4});
    const record4 = await manager(model1.alias).create({[field1.alias]:6, [field2.alias]:7});

    const { records = [] } = await new Fetcher(model1, sandbox, { sort:`->${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records, record=>record.id)).toEqual([record1.id, record4.id, record2.id, record3.id]);

    const { records: records1 = [] } = await new Fetcher(model1, sandbox, { sort:`>${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records1, record=>record.id)).toEqual([record3.id, record2.id, record4.id, record1.id]);

    const { records: records2 = [] } = await new Fetcher(model1, sandbox, { sort:`-<${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records2, record=>record.id)).toEqual([record4.id, record2.id, record3.id, record1.id]);

    const { records: records3 = [] } = await new Fetcher(model1, sandbox, { sort:`<${field1.alias} ${field2.alias}` }).fetch();
    expect(map(records3, record=>record.id)).toEqual([record1.id, record3.id, record2.id, record4.id]);
  });
});
