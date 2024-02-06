import PlannedManager from '../../background/planned/index.js';

const onBeforeCreate = (record, sandbox) => new PlannedManager(record, sandbox).perform('validate');
const onBeforeUpdate = (record, sandbox) => new PlannedManager(record, sandbox).perform('validate');

export default {
  before_create: [onBeforeCreate],
  before_update: [onBeforeUpdate],
};
