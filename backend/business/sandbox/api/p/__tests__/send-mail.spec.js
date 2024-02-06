import sendMailFunction from '../send-mail';
import * as HELPERS from '../send-mail/helpers';

describe('p.sendMail(params, attachments)', () => {
  it('Should properly run and return email record', async () => {
    jest.spyOn(HELPERS, 'validateParams');
    jest.spyOn(HELPERS, 'linkAttachments');

    const params = { to: 'to', subject: 'subject', body: 'body' };
    const attachments = [{ linkTo: jest.fn() }];

    const sendMail = sendMailFunction(sandbox);
    const result = await sendMail(params, attachments);

    expect(HELPERS.validateParams).toBeCalledWith(params, expect.any(Array), ['body', 'subject', 'to']);
    expect(HELPERS.linkAttachments).toBeCalledWith(expect.objectContaining(params), attachments, sandbox);

    expect(result).toMatchObject(params);
  });
});
