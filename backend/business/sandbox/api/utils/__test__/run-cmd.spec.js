import runCMDFunction from '../run-cmd/index.js';
import CMDRunner from '../run-cmd/runner.js';

describe('Sandbox', () => {
  describe('utils.runCMD(command, options)', () => {
    it('Should properly run', async () => {
      const runCMD = runCMDFunction(sandbox);

      const command = 'command';
      const options = {};

      CMDRunner.prototype.run = jest.fn(() => ({ command, options }));

      const result = await runCMD(command, options);
      const expected = { command, options };

      expect(result).toEqual(expected);
    });
  });
});
