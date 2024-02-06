import fs from 'fs';

export function env() {
  if (process.env.APP_SECRET_ALGORITHM) {
    if (process.env.APP_SECRET_PRIVATE) {
      try {
        process.env.APP_SECRET_PRIVATE = fs.readFileSync(process.env.APP_SECRET_PRIVATE);
      } catch (error) {
        console.error(`APP_SECRET_PRIVATE not found. ${error}`)
        process.exit(1);
      }
    } else {
      console.error('Please define APP_SECRET_PRIVATE environment variable');
      process.exit(1);
    }

    if (process.env.APP_SECRET_PUBLIC) {
      try {
        process.env.APP_SECRET_PUBLIC = fs.readFileSync(process.env.APP_SECRET_PUBLIC);
      } catch (error) {
        console.error(`APP_SECRET_PUBLIC not found. ${error}`)
        process.exit(1);
      }
    } else {
      console.error('Please define APP_SECRET_PUBLIC environment variable');
      process.exit(1);
    }
  }

  process.env.DOMAIN = 'web';
  process.env.APP_NAME = process.env.APP_NAME || 'common';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.PORT = process.env.PORT || 8080;
  process.env.DB_TYPE = process.env.DB_TYPE || 'postgres';
  process.env.APP_SECRET = process.env.APP_SECRET || 'plasticine'
  process.env.ROOT_ENDPOINT = process.env.ROOT_ENDPOINT || '/api/v1'
}