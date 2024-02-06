class Store {
  constructor() {
    this.store = {};
  }

  put(name, blob) {
    this.store[name] = blob;
  }

  get(name) {
    return this.store[name];
  }

  remove(name) {
    delete this.store[name];
  }
}

export default new Store();
