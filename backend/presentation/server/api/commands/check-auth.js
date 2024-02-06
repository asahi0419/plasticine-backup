import passport from '../../passport/index.js';

export default async (req, res) => {
  try {
    const result = await new Promise((resolve) => {
      passport.authenticate(['token', 'jwt'], { session: false }, async (err, verified) => {
        if (verified) return resolve(true);

        resolve(false);
      })(req, res, resolve);
    });

    res.send(result);
  } catch (error) {
    res.error(error);
  }
};
