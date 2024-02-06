import PlasticineApi from '../../../../api';

export default class ModelProxy {
  constructor(model) {
    this.model = model;
  }

  getValue(fieldAlias) {
    return this.model[fieldAlias];
  }

  fetchRecords(params) {
    return PlasticineApi.fetchRecords(this.model.alias, params);
  }
}
