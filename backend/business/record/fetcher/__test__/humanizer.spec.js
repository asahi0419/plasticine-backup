import humanizer, * as HUMANIZER from '../humanizer/index.js';

describe('Record', () => {
  describe('Fetcher', () => {
    describe('Humanizer', () => {
      it('Should correctly process humanize param', async () => {
        let result, expected;
        const model = db.getModel('model');

        result = await humanizer({ model, sandbox, params: { humanize: false } });
        expected = undefined;
        expect(result).toEqual(expected);

        jest.spyOn(HUMANIZER, 'humanize');
        result = await humanizer({ model, sandbox, params: { humanize: true } });
        expect(HUMANIZER.humanize).toBeCalled();
      });
    });
  });
})
