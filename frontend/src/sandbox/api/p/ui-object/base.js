import lodash from 'lodash';

export default class Base {
  constructor(attributes, options = {}, parent) {
    this.setType();
    this.setListeners();

    this.attributes = attributes;
    this.children = [];
    this.options = options;

    if (parent) {
      this.parent = parent;
      this.parent.load('child', this);
    }

    this.setDefaults();
  }

  setDefaults() {

  }

  setAttributes(attributes) {
    this.attributes = { ...this.attributes, ...attributes };
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  getOptions() {
    return this.options;
  }

  // ------- API -------

  setType() {
    this.type = 'base';
  }

  setListeners() {
    this.listeners = {
      load: [],
    };
  }

  getType() {
    return this.type || this.attributes.__type;
  }

  getMode() {
    
  }

  getParent() {
    return this.parent;
  }

  getAttributes() {
    return this.attributes;
  }

  getValue(alias) {
    return this.attributes[alias];
  }
  
  setValue(alias, value) {
    return this.attributes[alias] = value;
  }

  isPopup() {
    return !!this.options.popup;
  }

  close(params) {
    const { onClose } = this.options;
    if (onClose) onClose(params);
  }

  load(type, data = {}) {
    if (type === 'child') {
      this.children.push(data);
      this.listeners.load.forEach((fn) => fn({ type, data }));
    }
  }

  on(event, fn) {
    this.listeners[event].push(fn);
  }

  emit = async (event, data, callback) => {
    const fn = lodash.last(this.listeners[event]);

    if (fn) {
      try {
        const result = await fn(data);

        if (callback) {
          await callback({ event, data, result });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}
