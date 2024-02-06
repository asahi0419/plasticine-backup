export default class BaseResolver {
  resolve(model) {
    return `object_${model.id}`;
  }
}
