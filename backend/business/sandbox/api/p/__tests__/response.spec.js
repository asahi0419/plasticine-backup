import ResponseProxy from '../response/proxy';
import responseNamespace from '../response';

describe('p.response', () => {
  it('Should return response proxy instance', () => {
    const context = { response: {}, request: {} };

    const result = responseNamespace(context);
    const expected = new ResponseProxy(context.response, context.request);

    expect(result).toEqual(expected);
  });
});
