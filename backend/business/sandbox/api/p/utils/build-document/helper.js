import { isEmpty, cloneDeep, find, each, filter } from 'lodash-es';

import { prepareFormData } from "../get-form-rawxml/index.js";

const checkAttachmentTab = (originalComponents, fields) => {
    let status = false;
    const components = cloneDeep(originalComponents);
  
    const sectionComponents = filter(components.list, (component) => {
      const field = find(fields, ({ attributes }) => (attributes.alias === component)) || {attributes: {}};
      return ['data_template'].includes(field.attributes.type);
    });
  
    const componentsList = filter(components.list, component => !sectionComponents.includes(component));
  
    each(componentsList, (component) => {
      if (component.startsWith('__attachments__')) {
        status = true;
        return false;
      }
    });
  
    return status;
  }

  
export const hasAttachmentTab = async (sandbox, modelAlias, id, options) => {
    let hasAttachment = false;
    const { data } = await prepareFormData(sandbox, modelAlias, id, options);
    if (!isEmpty(data.form.attributes.options)) {
        const formOptions = JSON.parse(data.form.attributes.options)
        const components = formOptions.components
        hasAttachment = checkAttachmentTab(components, data.fields)
    }
    return hasAttachment
}