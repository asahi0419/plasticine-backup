export default class ConcatenatedField {
  constructor(column, model) {
    this.column = column;
    this.type = 'concatenated_field';
    this.model = model;
  }
}
