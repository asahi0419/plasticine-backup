import logger from '../logger/index.js';
import { SystemError } from './index.js';

function underscore(str) {
  return str.replace(new RegExp('([A-Z])', 'g'), '_$1').replace(new RegExp('^_'), '').toLowerCase();
}

export const errorHandler = (err, req, res, next) => {
  const error = (err instanceof Error) ? new SystemError(err.message, err.stack) : err;
  if (req.user) error.user = req.user.id;

  logger.error(error);

  res.status(error.httpStatus || 500).json({
    errors: [{
      id: error.id,
      name: error.name,
      message: error.message || req.t(`static.${underscore(error.name)}`),
      description: error.description,
    }],
  });
};
