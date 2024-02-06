import { convert } from 'html-to-text';
import * as htmlparser2 from 'htmlparser2'

export default (mailToParse) => {
  const mail = {
    from: '',
    to: '',
    subject: '',
    cc: '',
    body: '',
    type: 'in',
    status: 'new',
    content_type: 'text',
    created_by: 1,
    sent_at: '',
  };

  mail.from = mailToParse.from.value[0].address;
  mail.to = mailToParse.to ? parseAddress(mailToParse.to.value) : mailToParse.headers.get('delivered-to').text;
  mail.cc = mailToParse.cc ? parseAddress(mailToParse.cc.value) : null;
  mail.body = convert(mailToParse.textAsHtml).trim() || convertToPlain(mailToParse.html) || '**no email body**';
  mail.subject = mailToParse.subject || '**no subject**';
  mail.sent_at = mailToParse.date;

  return mail;
}

function convertToPlain(html) {
  let parsedText = ``;
  const parser = new htmlparser2.Parser(
    {
      ontext: function (text) {
        parsedText += text;
      },
    },
    { decodeEntities: true }
  );
  parser.write(html);
  parser.end();
  return parsedText.trim();
}

function parseAddress(recipients) {
  let parsedAddress='';
  recipients.forEach(({address})=> {
    parsedAddress +=`${address}, `;
  });

  return parsedAddress.trim().slice(0, -1);
}