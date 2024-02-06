import qs from 'qs';
import url from 'url';
import Promise from 'bluebird';
import WebSocket from 'ws';
import { uniq } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import cache from '../shared/cache/index.js';
import logger from '../../business/logger/index.js';
import passport from './passport/index.js';
import Sandbox from '../../business/sandbox/index.js';
import * as SECURITY from '../../business/security/index.js';

export const WEBSOCKET_CHANNEL_PREFIX = 'websocket:';

export default (server) => {
  const wss = new WebSocket.Server({
    server,
    path: '/ws',
    verifyClient: (client, cb) => {
      const req = client.req;
      const next = () => cb(true);

      passport.authenticate(['token', 'jwt'], { session: false }, async (err, user, info) => {
        if (user) {
          req.channels = await extractAndValidateChannels(req, user);
          req.user = user;

          next();
        } else if (info) {
          cb(false, 401, 'Unauthorized');
        }
      })(req, {}, next);
    },
  });

  cache.namespaces.core.messageBus.on('message', (message, channel) => {
    const { type, payload } = message;
    const channelName = channel.replace(WEBSOCKET_CHANNEL_PREFIX, '');

    return wss.clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) return;
      if (!client.upgradeReq.channels.includes(channelName)) return;

      if (type === 'command' && payload.session && payload.session.created_by) {
        if (client.upgradeReq.user.id === payload.session.created_by) {
          client.send(message);
        }
      } else {
        client.send(message);
      }
    });
  });

  wss.on('connection', (client, req) => {
    client.upgradeReq = req;

    client.on('error', (err) => {
      if (err.errno) return; // Ignore network errors like `ECONNRESET`, `EPIPE`, etc.
      throw err;
    });

    client.on('message', (message) => processIncomingMessage(message, req));
  });

  return wss;
};

async function extractAndValidateChannels(req, user) {
  let validChannels = [];

  const parsedUrl = url.parse(req.url);
  const { channels = [] } = qs.parse(parsedUrl.query);

  if (channels.length) {
    const sandbox = await Sandbox.create({ request: req, user });
    const records = await db.model('web_socket').where({ active: true }).whereIn('alias', channels);

    await Promise.each(records, async (record) => {
      try {
        if (await SECURITY.checkAccess('web_socket', record, sandbox)) {
          validChannels.push(record.alias);
        }
      } catch(error) {
        logger.error(error);
      }
    });
  }

  return validChannels.length ? uniq(validChannels) : ['default'];
}

async function processIncomingMessage(data, { user, channels }) {
  const records = await db.model('web_socket').where({ active: true }).whereIn('alias', channels);

  if (records.length) {
    const request = { params: { data }, query: {}, body: {} };
    const sandbox = await Sandbox.create({ request, user });

    await Promise.map(records, async (record) => {
      if (record.receiver_script) {
        await sandbox.executeScript(record.receiver_script, `web_socket/${record.id}/receiver_script`);
      }
    });
  }
}
