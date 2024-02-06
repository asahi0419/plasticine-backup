import cache from '../../../../../../presentation/shared/cache/index.js';
import WSProxy from '../proxy';
import Sandbox from '../../../../../sandbox/index.js';
import serializer from '../../../../../record/serializer/json';
import { mbQueueName } from '../helpers';

const { manager } = h.record;

afterEach(() => jest.clearAllMocks());

describe('p.ws', () => {
  describe('WSProxy', () => {
    describe('constructor(user)', () => {
      it('Should set user', () => {
        const user = 'user';
        const proxy = new WSProxy(user);

        const result = proxy.user;
        const expected = user;

        expect(result).toEqual(expected);
      });
    });

    describe('send(webSocketAlias, data)', () => {
      it('Should throw error if ws not found', async () => {
        const proxy = new WSProxy();
        const webSocketAlias = 'webSocketAlias';
        const data = 'data';

        await expect(proxy.send(webSocketAlias, data)).rejects.toMatchObject({ name: 'WebSocketNotFoundError' });
      });

      it('Should send data to ws with alias and sender script', async () => {
        jest.spyOn(Sandbox.prototype, 'executeScript');

        const webSocketAlias = 'webSocketAlias';
        const ws = await manager('web_socket').create({ alias: webSocketAlias, sender_script: 'return' });

        const proxy = new WSProxy();
        const data = 'data';

        await proxy.send(webSocketAlias, data);

        expect(Sandbox.prototype.executeScript).toBeCalledWith(
          ws.sender_script,
          `web_socket/${ws.id}/sender_script`
        );
      });
    });

    describe('sendMessage(message)', () => {
      it('Should publish message payload by message bus', () => {
        jest.spyOn(cache.namespaces.core.messageBus, 'publish');

        const message = 'message';
        const proxy = new WSProxy();

        proxy.sendMessage(message);

        expect(cache.namespaces.core.messageBus.publish).toBeCalledWith(
          mbQueueName(),
          { type: 'message', payload: message }
        );
      });
    });

    describe('sendRecords(records)', () => {
      it('Should publish records payload by message bus', () => {
        jest.spyOn(cache.namespaces.core.messageBus, 'publish');

        const records = 'records';
        const proxy = new WSProxy();

        proxy.sendRecords(records);

        expect(cache.namespaces.core.messageBus.publish).toBeCalledWith(
          mbQueueName(),
          { type: 'records', payload: { data: serializer(records) } }
        );
      });
    });

    describe('sendGeoData(geoJson)', () => {
      it('Should publish geoJson payload by message bus', () => {
        jest.spyOn(cache.namespaces.core.messageBus, 'publish');

        const geoJson = 'geoJson';
        const proxy = new WSProxy();

        proxy.sendGeoData(geoJson);

        expect(cache.namespaces.core.messageBus.publish).toBeCalledWith(
          mbQueueName(),
          { type: 'geo_data', payload: geoJson }
        );
      });
    });

    describe('sendCommand(command)', () => {
      it('Should publish command payload by message bus', () => {
        jest.spyOn(cache.namespaces.core.messageBus, 'publish');

        const command = 'command';
        const proxy = new WSProxy();

        proxy.sendCommand(command);

        expect(cache.namespaces.core.messageBus.publish).toBeCalledWith(
          mbQueueName(),
          { type: 'command', payload: command }
        );
      });
    });

    describe('sendUpdateStore(message)', () => {
      it('Should publish message payload by message bus', () => {
        jest.spyOn(cache.namespaces.core.messageBus, 'publish');

        const message = 'message';
        const proxy = new WSProxy();

        proxy.sendUpdateStore(message);

        expect(cache.namespaces.core.messageBus.publish).toBeCalledWith(
          mbQueueName(),
          { type: 'update_store', payload: message }
        );
      });
    });
  });
});
