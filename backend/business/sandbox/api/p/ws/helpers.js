import { WEBSOCKET_CHANNEL_PREFIX } from '../../../../../presentation/server/wss.js';

export const mbQueueName = (channelName = 'default') => {
  return `${WEBSOCKET_CHANNEL_PREFIX}${channelName}`;
}
