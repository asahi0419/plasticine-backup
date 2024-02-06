import { processSessionValue } from '../setting.js';
import * as SESSION from '../../../user/session.js';

const { record, randomNumber, email } = h;
const { manager } = record;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('processSessionValue', () => {
  it('Should close all active sessions if multisession changed to false', async () => {
    const record = { value: JSON.stringify({ multisession: false }) };
    const sandbox = { translate: () => 'translate' };

    jest.spyOn(SESSION, 'closeAllActiveSessions');
    await processSessionValue(record, sandbox);
    expect(SESSION.closeAllActiveSessions).toBeCalledWith(expect.objectContaining({ id: 1 }), { message: 'translate', reason_to_close: 'auto' }, sandbox);
  });
  it('Should not close all active sessions if multisession changed to true', async () => {
    const record = { value: JSON.stringify({ multisession: true }) };
    const sandbox = { translate: () => 'translate' };

    jest.spyOn(SESSION, 'closeAllActiveSessions');
    await processSessionValue(record, sandbox);
    expect(SESSION.closeAllActiveSessions).not.toBeCalledWith(expect.objectContaining({ id: 1 }), { message: 'translate', reason_to_close: 'auto' }, sandbox);
  });
});
