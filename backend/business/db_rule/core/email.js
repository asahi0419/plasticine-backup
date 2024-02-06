const fillingOnUpdate = (email, sandbox) => {
  const previousAttributes = email.__previousAttributes;
  if (previousAttributes.status === email.status) return;

  if (email.status === 'enqueued') {
    email.enqueued_at = new Date();
    email.worker_ts = new Date();
  } else if (email.type === 'out' && email.status === 'processed') {
    email.sent_at = new Date();
  }

  if (['processed', 'error'].includes(email.status)) {
    email.processing_attempts = +(email.processing_attempts || 0) + 1;
  }
};

export default {
  before_update: [fillingOnUpdate],
};
