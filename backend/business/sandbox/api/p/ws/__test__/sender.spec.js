import cache from '../../../../../../presentation/shared/cache/index.js';
import WSSender from '../sender';
import { mbQueueName } from '../helpers';

afterEach(() => jest.clearAllMocks());

describe('p.ws', () => {
  describe('WSSender', () => {
    describe('constructor(channel)', () => {
      it('Should set channel', () => {
        const channel = 'channel';
        const sender = new WSSender(channel);

        const result = sender.channel;
        const expected = channel;

        expect(result).toEqual(expected);
      });
    });

    describe('status()', () => {
      it('Should return WSSender instance', () => {
        const sender = new WSSender();

        const result = sender.status();
        const expected = sender;

        expect(result).toEqual(expected);
      });
    });

    describe('json(payload)', () => {
      it('Should publish payload by message bus', () => {
        jest.spyOn(cache.namespaces.core.messageBus, 'publish');

        const channel = 'channel';
        const sender = new WSSender(channel);
        const payload = 'payload';

        sender.json(payload);

        expect(cache.namespaces.core.messageBus.publish).toBeCalledWith(
          mbQueueName(channel),
          { channel_name: channel, payload, type: 'data' }
        );
      });
    });
  });
});
