import WSProxy from '../ws/proxy';
import wsNamespace from '../ws';

describe('p.ws', () => {
  it('Should return ws proxy instance', () => {
    const { user } = sandbox;

    const result = wsNamespace({ user });
    const expected = new WSProxy(user);

    expect(result).toEqual(expected);
  });
});
