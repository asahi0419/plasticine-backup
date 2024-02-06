import PlannedManager from '../../background/planned/index.js';

const onAfterInsert = (record, sandbox, mode) => {
  if (process.env.NODE_ENV !== 'test') {
    if (mode !== 'secure') return; // do not execute while seeding
  }

  return new PlannedManager(record, sandbox).perform('create');
}
const onAfterUpdate = (record, sandbox) => {
  return new PlannedManager(record, sandbox).perform('update');
}

export default {
  after_insert: [onAfterInsert],
  after_update: [onAfterUpdate],
};
