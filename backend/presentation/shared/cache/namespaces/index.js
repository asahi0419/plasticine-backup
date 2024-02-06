import Base from './base/index.js';
import Core from './core/index.js';
import MessageBus from '../message-bus.js';

const NamespaceTypes = {
  base: Base,
  core: Core,
};

const namespaces = [
  { type: 'core', host: process.env.REDIS_CORE_HOST || 'redis-core' },
  { type: 'custom', host: process.env.REDIS_CUSTOM_HOST || 'redis-custom' },
];

export default namespaces.reduce((result, { type, host }) => {
  if ((process.env.NODE_ENV === 'test') && (type === 'custom')) return result;

  const Namespace = NamespaceTypes[type] || NamespaceTypes['base'];
  const messageBus = new MessageBus({ host, scope: type });

  return { ...result, [type]: new Namespace(messageBus, namespaces[type]) };
}, {});
