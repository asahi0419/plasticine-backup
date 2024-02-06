import PubSub from 'pubsub-js';

export const EDITOR_SHOW = 'inline_editor:show';

export function showInlineEditor(id, data, target) {
  PubSub.publish(EDITOR_SHOW, { id, data });
}

export function subscribeInlineEditor(id, cb) {
  return PubSub.subscribe(EDITOR_SHOW, (_, options) => {
    if (id !== options.id) return;
    cb(options.data);
  });
}

export function unsubscribeInlineEditor(token) {
  PubSub.unsubscribe(token);
}
