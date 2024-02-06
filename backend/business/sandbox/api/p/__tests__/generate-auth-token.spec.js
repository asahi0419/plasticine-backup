import jwt from 'jsonwebtoken';

import generateAuthToken from '../generate-auth-token.js';

describe('p.generateAuthToken(user)', () => {
  it('Should generate auth token', () => {
    const context = {
      secret: process.env.APP_SECRET,
      options: {}
    };
    if (process.env.APP_SECRET_ALGORITHM) {
      context.secret = process.env.APP_SECRET_PRIVATE;
      context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
    }

    const result = generateAuthToken(sandbox.user);
    const expected = jwt.sign(sandbox.user, context.secret, context.options);

    expect(result).toEqual(expected);
  });
});
