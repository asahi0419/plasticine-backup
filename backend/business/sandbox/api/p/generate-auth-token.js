import jwt from 'jsonwebtoken';

export default (user) => {
  const context = {
    secret: process.env.APP_SECRET,
    options: {}
  };
  if (process.env.APP_SECRET_ALGORITHM) {
    context.secret = process.env.APP_SECRET_PRIVATE;
    context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
  }

  return jwt.sign(user, context.secret, context.options)
};
