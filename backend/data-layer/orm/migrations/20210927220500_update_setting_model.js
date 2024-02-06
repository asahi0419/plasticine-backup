import * as HELPERS from './helpers/index.js';

const FORM_OPTIONS = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'name',
      'group',
      '__column__.1_2',
      'alias',
      'description',
      '__section__.2',
      'value',
      '__attachments__',
      '__tab__.service',
      '__section__.3',
      'id',
      '__section__.4',
      '__column__.4_1',
      'created_at',
      'updated_at',
      '__column__.4_2',
      'created_by',
      'updated_by',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__attachments__': { name: 'Attachments' },
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

const migrate = (knex) => async (models) => {
  const settingForm = await HELPERS.getRecord(knex, 'form', { model: models.setting.id });
  if (settingForm) await HELPERS.updateRecord(knex, 'form', { id: settingForm.id }, { options: FORM_OPTIONS });
};

export const up = (knex) => {
  const models = ['model', 'form', 'setting'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = function (knex, Promise) {
  Promise.resolve();
};
