import { mbQueueName } from '../helpers';
import { WEBSOCKET_CHANNEL_PREFIX } from '../../../../../../presentation/server/wss';

describe('p.ws', () => {
  describe('Helpers', () => {
    describe('mbQueueName(channelName)', () => {
      it('Should return default queue name', () => {
        const result = mbQueueName();
        const expected = `${WEBSOCKET_CHANNEL_PREFIX}default`;

        expect(result).toEqual(expected);
      });

      it('Should return custom queue name', () => {
        const channelName = 'channelName';

        const result = mbQueueName(channelName);
        const expected = `${WEBSOCKET_CHANNEL_PREFIX}${channelName}`;

        expect(result).toEqual(expected);
      });
    });
  });
});
