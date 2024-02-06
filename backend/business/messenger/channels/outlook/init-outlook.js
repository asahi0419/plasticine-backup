import msal from '@azure/msal-node';
import moment from 'moment';

import logger from '../../../logger/index.js';

const MSAUTHORITYLINK = 'https://login.microsoftonline.com/';
const MSTOKENSCOPE = 'https://graph.microsoft.com/.default';

export class OutlookOAuth {
  constructor(config) {
    this.accessToken = '';
    this.extExpiresOn = '';
    this.config = config;
  }

  async getAccessToken() {
    if (moment(this.extExpiresOn).isAfter(moment())) {
      return this.accessToken;
    }

    this.config.clientId = this.config.clientID;
    this.config.authority = `${MSAUTHORITYLINK}${this.config.tenantID}`;

    const authConfig = { auth: this.config };
    const tokenScopes = [ MSTOKENSCOPE ];
    const cca = new msal.ConfidentialClientApplication(authConfig);
    const authResponse = await cca.acquireTokenByClientCredential({
      scopes: tokenScopes,
    });

    if (!authResponse.accessToken || !authResponse.accessToken.length) {
      return logger.error('Error: cannot obtain access token.');
    }
    
    this.accessToken = authResponse.accessToken;
    this.extExpiresOn = authResponse.extExpiresOn;

    return authResponse.accessToken;
  }
}
