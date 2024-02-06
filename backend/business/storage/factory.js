import AWS from 'aws-sdk';

import Storage from './index.js';

export default async () => {
  const params = {
    type: process.env.STORAGE_TYPE,
    host: process.env.STORAGE_HOST,
    port: process.env.STORAGE_PORT,
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
    access_key: process.env.STORAGE_ACCESS_KEY,
    secret_key: process.env.STORAGE_SECRET_KEY,
    ssl: process.env.STORAGE_SSL === 'true',
    part_size: process.env.STORAGE_PART_SIZE,
    path_style: process.env.STORAGE_PATH_STYLE,
  };

  if (process.env.AWS_ROLE_ARN) {
    const sts = new AWS.STS();
    let role;

    if (process.env.AWS_WEB_IDENTITY_TOKEN) {
      role = await sts.assumeRoleWithWebIdentity({
        RoleArn: process.env.AWS_ROLE_ARN,
        RoleSessionName: `role-session-${(new Date()).getTime()}`,
        WebIdentityToken: process.env.AWS_WEB_IDENTITY_TOKEN,
      }).promise();
    } else {
      role = await sts.assumeRole({
        RoleArn: process.env.AWS_ROLE_ARN,
        RoleSessionName: `role-session-${(new Date()).getTime()}`,
      }).promise();
    }

    if (role) {
      params.access_key = role.Credentials.AccessKeyId;
      params.secret_key = role.Credentials.SecretAccessKey;
      params.session_token = role.Credentials.SessionToken;
    }
  }
  else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    params.access_key = process.env.AWS_ACCESS_KEY_ID;
    params.secret_key = process.env.AWS_SECRET_ACCESS_KEY;
  }

  return new Storage(params);
};
