class GlobalStore {
  constructor() {
    this.store = {};
  }

  set(key, value) {
    this.store[key] = value;
    return true;
  }

  get(key) {
    return this.store[key];
  }
}

export default () => new GlobalStore();
