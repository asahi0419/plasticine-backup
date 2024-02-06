import Base from './base';

export default class ViewObject extends Base {
  setType() {
    this.type = 'view';
  }

  setListeners() {
    this.listeners = {
      load: [],
      draw: [],
    };
  }

  getMode() {
    const { type, exec_by = {} } = this.options;
    return type || exec_by.type;
  }

  getSelectedRecords() {
    return this.options.selectedRecords || [];
  }

  onDraw(data = {}) {
    this.on('draw', data);
  }

  setDefaults() {
    // just an example:

    // if (this.parent) {
    //   this.onDraw(async ({ action, target, element }) => {
    //     if (target.newValue.properties.editable === 'free') {
    //       const model = 'free_geo_object';
    //       const attributes = {
    //         model_id: this.parent.getRecord().getModel().getValue('id'),
    //         record_id: this.parent.getRecord().getValue('id'),
    //         appearance_id: this.getValue('appearance'),
    //       };

    //       if (target.type === 'point') attributes.type = 'geo_point';
    //       if (target.type === 'lineString') attributes.type = 'geo_line_string';

    //       attributes[attributes.type] = target.newValue.geometry.coordinates;

    //       try {
    //         let result;

    //         switch (action) {
    //           case 'new':
    //             result = await p.uiUtils.createRecord(model, { data: { attributes } });
    //             target.newValue.properties.id = result.data.data.id;
    //             break;
    //           case 'change':
    //             result = await p.uiUtils.updateRecord(model, target.newValue.properties.id, { data: { attributes } });
    //             break;
    //           case 'delete':
    //             result = await p.uiUtils.deleteRecord(model, target.newValue.properties.id);
    //             break;
    //         }

    //         p.actions.showMessage(p.translate('map_draw_changes_successfully_saved'))
    //         return true;
    //       } catch (error) {
    //         console.log(error);
    //         p.actions.showMessage({ type: 'negative', content: p.translate('map_draw_cannot_perform_object_processing') });
    //         return false;
    //       }
    //     }
    //   });
    // }
  }
}