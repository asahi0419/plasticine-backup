export const up = async (knex) => {
  const hasTable = await knex.schema.hasTable('knex_seeding')
  const hasColumn = await knex.schema.hasColumn('knex_seeding', 'error')

  if (hasTable && hasColumn) {
    return knex.raw(`
UPDATE public.knex_seeding
SET error = ''
WHERE error != '';
    `);
  }
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
