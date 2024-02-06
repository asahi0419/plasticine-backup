import translateFunction from '../translate';

describe('p.translate(...args)', () => {
  it('Should properly run', () => {
    const args = ['arg1', 'arg2'];

    const result = translateFunction(sandbox)(...args);
    const expected = sandbox.translate(...args);

    expect(result).toEqual(expected);
  });
});
