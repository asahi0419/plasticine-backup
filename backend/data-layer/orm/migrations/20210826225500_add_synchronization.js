import Promise from 'bluebird';
import { filter } from 'lodash-es';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

const CORE_MODELS = [
  'user',
  'action',
  'appearance',
  'field',
  'filter',
  'form',
  'layout',
  'permission',
  'privilege',
  'view',
  'ui_rule',
];

const addSyncColumn = table => table.jsonb('sync');

export const up = async (knex) => {
  if (!await knex.schema.hasColumn(modelsTableName, 'sync')) {
    await knex.schema.alterTable(modelsTableName, addSyncColumn);
  }

  await fillSyncColumns(knex);

  await knex.raw(onModelUpdateTrigger);

  const metaModelsId = await knex.select('id').from(modelsTableName).whereIn('alias', filter(CORE_MODELS, alias => alias !== 'user')).then(rows => rows.map(row => row.id));
  await Promise.each(metaModelsId, modelId => knex.raw(onMetaUpdateTrigger(getTableName({ id: modelId }))));
};

const fillSyncColumns = async knex => {
  const coreModels = await knex.select('*').from(modelsTableName).whereIn('alias', CORE_MODELS).andWhere('__inserted', true);
  const customModels = await knex.select('*').from(modelsTableName).where({ type: 'custom', __inserted: true });

  const syncData = await Promise.reduce([ ...coreModels, ...customModels ], async (result, model) => {
    const metaSync = await Promise.reduce(filter(coreModels, model => model.alias !== 'user'), async (result, metaModel) => {
      const records = await knex.select('updated_at', 'created_at').from(getTableName({ id: metaModel.id }))
        .where({ __inserted: true })
        .andWhere({ model: model.id });

      const uniqueDates = records.reduce((result, record) => {
        result.add(new Date(record.created_at).getTime());
        result.add(new Date(record.updated_at).getTime());

        return result;
      }, new Set());

      const [ biggestDate ] = [ ...uniqueDates ].sort((a, b) => b - a);

      result[metaModel.alias] = biggestDate || Date.now();

      return result;
    }, {});

    const modelCreatedAt = new Date(model.created_at).getTime();
    const modelUpdatedAt = new Date(model.updated_at).getTime();
    const lastModelUpdate = modelUpdatedAt > modelCreatedAt ? modelUpdatedAt : modelCreatedAt;

    result[model.id] = { model: lastModelUpdate, ...metaSync };

    return result;
  }, {});

  await Promise.each(Object.keys(syncData), modelId => {
    return knex(modelsTableName)
      .update({ sync: syncData[modelId] })
      .where('id', modelId);
  });
};


const onModelUpdateTrigger = `
  CREATE OR REPLACE FUNCTION model_sync_trigger_fnc()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
  $$
  BEGIN
    IF (OLD.updated_at IS NULL OR NEW.updated_at <> OLD.updated_at) AND NEW.__inserted = true AND NEW.type IN ('core', 'custom') THEN
      UPDATE ${modelsTableName}
      SET sync = jsonb_set(COALESCE(sync, '{}'::jsonb), '{model}', to_jsonb(extract(epoch from COALESCE(NEW.updated_at, NEW.created_at)) * 1000))
      WHERE id = NEW.id;

      PERFORM pg_notify('synchronization_update', json_build_object('id', NEW.id, 'value', (SELECT sync FROM ${modelsTableName} where id = NEW.id))::text);
    END IF;

    IF NEW IS NULL AND OLD.type IN ('core', 'custom') THEN
     PERFORM pg_notify('synchronization_update', json_build_object('id', OLD.id, 'value', NULL)::text);
    END IF;

    RETURN NEW;
  END;
  $$;

  DROP TRIGGER IF EXISTS model_create_or_update_trigger
    ON public.${modelsTableName};

  CREATE TRIGGER model_create_or_update_trigger
    AFTER INSERT OR DELETE OR UPDATE OF updated_at, created_at
    ON public.${modelsTableName}
    FOR EACH ROW
    EXECUTE PROCEDURE model_sync_trigger_fnc();`;

const onMetaUpdateTrigger = tableName => `
  CREATE OR REPLACE FUNCTION meta_sync_trigger_fnc()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
  $$
  DECLARE
    meta_model_id int;
    meta_model_name text;
    related_model_type text;
  BEGIN
    related_model_type = (SELECT type from object_1 where id = COALESCE(OLD.model, NEW.model))::text;
    meta_model_id := substring(TG_TABLE_NAME::regclass::text, 8)::int;
    meta_model_name := (SELECT alias from ${modelsTableName} where id = meta_model_id)::text;

    IF (OLD.updated_at IS NULL OR NEW.updated_at <> OLD.updated_at) AND NEW.__inserted = true AND related_model_type IN ('core', 'custom') THEN
      UPDATE ${modelsTableName}
      SET sync = jsonb_set(COALESCE(sync, '{}'::jsonb), string_to_array(meta_model_name, ','), to_jsonb(extract(epoch from COALESCE(NEW.updated_at, NEW.created_at)) * 1000))
      WHERE id = NEW.model;

      PERFORM pg_notify('synchronization_update',  json_build_object('id', NEW.model, 'value', (SELECT sync FROM ${modelsTableName} where id = NEW.model))::text);
    END IF;

    IF NEW IS NULL AND related_model_type IN ('core', 'custom') THEN
     UPDATE ${modelsTableName}
      SET sync = jsonb_set(COALESCE(sync, '{}'::jsonb), string_to_array(meta_model_name, ','), to_jsonb(FLOOR(extract(epoch from now())*1000)))
      WHERE id = OLD.model;

     PERFORM pg_notify('synchronization_update', json_build_object('id', OLD.model, 'value', (SELECT sync FROM ${modelsTableName} where id = OLD.model))::text);
    END IF;

    RETURN NEW;
  END;
  $$;

  DROP TRIGGER IF EXISTS meta_create_or_update_trigger
    ON public.${tableName};

  CREATE TRIGGER meta_create_or_update_trigger
    AFTER INSERT OR DELETE OR UPDATE OF updated_at, created_at
    ON public.${tableName}
    FOR EACH ROW
    EXECUTE PROCEDURE meta_sync_trigger_fnc();
`;

export const down = function (knex, Promise) {
  return Promise.resolve();
};
