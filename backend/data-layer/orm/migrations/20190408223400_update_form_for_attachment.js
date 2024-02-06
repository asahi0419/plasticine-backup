/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'file_name',
      'version',
      'target_record',
      'file_content_type',
      'file_size',
      '__column__.1_2',
      'last_version',
      'field',
      'thumbnail',
      'linked_from',
      '__tab__.service',
      '__section__.2',
      'id',
      '__section__.3',
      '__column__.3_1',
      'created_at',
      'updated_at',
      'p_lat',
      '__column__.3_2',
      'created_by',
      'updated_by',
      'p_lon',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

export const up = async (knex) => {
  const [ attachmentModel ] = await knex(modelsTableName).where({ alias: 'attachment' });
  if (!attachmentModel) return;

  await knex(formTableName).where({ model: attachmentModel.id, alias: 'default' }).update({ options: JSON.stringify(DEFAULT_FORM) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
