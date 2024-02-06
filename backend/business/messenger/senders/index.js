import EmailSender from './email.js';

const SENDERS = {
  email: EmailSender,
};

export default type => new SENDERS[type]();
