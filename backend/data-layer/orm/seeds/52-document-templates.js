export default {
  name: "Document Template",
  plural: "Document Templates",
  alias: "document_template",
  type: "core",
  template: "base",
  access_script: "p.currentUser.canAtLeastRead()",
  order: "-100",
  __lock: ["delete"],
  fields: [
    {
      name: "Name",
      alias: "name",
      type: "string",
      required_when_script: "true",
      __lock: ["delete"]
    },
    {
      name: "Alias",
      alias: "alias",
      type: "string",
      index: "unique",
      required_when_script: "true",
      options: { format: "^[a-zA-Z0-9_]+$" },
      __lock: ["delete"]
    },
    {
      name: "Template (docx)",
      alias: "export_template",
      type: "file",
      required_when_script: "true",
      __lock: ["delete"]
    },
    {
      name: "JS mapping script",
      alias: "js_mapping_script",
      type: "string",
      options: {
        length: 150000,
        rows: 6,
        syntax_hl: "js"
      },
      __lock: ["delete"]
    },
    {
      name: "Active?",
      alias: "active",
      type: "boolean",
      __lock: ["delete"]
    },
    {
      name: "Format",
      alias: "format",
      type: "array_string",
      options: {
        values: {
          pdf: "PDF",
          docx: "DOCX"
        }
      },
      required_when_script: "true",
      __lock: ["delete"]
    },
    {
      name: "Description",
      alias: "description",
      type: "string",
      options: { rows: 2 },
      __lock: ["delete"]
    }
  ],
  ui_rules: [
    {
      name: "Autogeneration of alias",
      order: "0",
      active: true,
      type: "on_change",
      script: `if (p.record.isPersisted()) return;
let aliases = [];
if (p.record.getModel && p.record.getModel().fetchRecords) {
const params = {
  filter: \`\\\`id\\\` != $\{p.record.getValue('id')\}\`,
  fields: { [\`_$\{p.record.getModel().getValue('alias')\}\`]: 'alias' },
  page: { size: 999 },
};
p.record.getModel().fetchRecords(params).then((result) => {
  aliases = result.data.data.map(({ attributes }) => attributes.alias);
});
} 
p.record.getField('name').onChange((oldValue, newValue) => {
const aliasValue = utils.parameterizeString(newValue, { length: 55, blackList: aliases });
p.record.setValue('alias', aliasValue);
});`,
      __lock: ["delete"]
    }
  ],
  records: [
    {
      name: "Docx grid view portrait",
      alias: "docx_grid_view_portrait",
      export_template: `grid-view-portrait.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const { exec_by, sort, fields, filter, hidden_filter, ids, embedded_to } = req;
  const result = await p.utils.getViewRawXML(params.modelAlias, params.viewAlias, { userTimeZone: user_timezone, exec_by, sort, fields, filter, hidden_filter, ids, embedded_to });  // In case return error
  if (typeof result !== 'string') throw new Error(\`Failed to generate content for \${result.name}\`)
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { view: result, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Grid view portrait template for docx file"
    },
    {
      name: "Docx grid view landscape",
      alias: "docx_grid_view_landscape",
      export_template: `grid-view-landscape.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const { exec_by, sort, fields, filter, hidden_filter, ids, embedded_to } = req;
  const result = await p.utils.getViewRawXML(params.modelAlias, params.viewAlias, { userTimeZone: user_timezone, exec_by, sort, fields, filter, hidden_filter, ids, embedded_to });  // In case return error
  if (typeof result !== 'string') throw new Error(\`Failed to generate content for \${result.name}\`)
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { view: result, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Grid view landscape template for docx file"
    },
    {
      name: "PDF grid view portrait",
      alias: "pdf_grid_view_portrait",
      export_template: `grid-view-portrait.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const { exec_by, sort, fields, filter, hidden_filter, ids, embedded_to } = req;
  const result = await p.utils.getViewRawXML(params.modelAlias, params.viewAlias, { userTimeZone: user_timezone, exec_by, sort, fields, filter, hidden_filter, ids, embedded_to });  // In case return error
  if (typeof result !== 'string') throw new Error(\`Failed to generate content for \${result.name}\`)
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { view: result, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "pdf",
      description: "Grid view portrait template for pdf file"
    },
    {
      name: "Pdf grid view landscape",
      alias: "pdf_grid_view_landscape",
      export_template: `grid-view-landscape.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const { exec_by, sort, fields, filter, hidden_filter, ids, embedded_to } = req;
  const result = await p.utils.getViewRawXML(params.modelAlias, params.viewAlias, { userTimeZone: user_timezone, exec_by, sort, fields, filter, hidden_filter, ids, embedded_to });  // In case return error
  if (typeof result !== 'string') throw new Error(\`Failed to generate content for \${result.name}\`)
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { view: result, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "pdf",
      description: "Grid view landscape template for pdf file"
    },
    {
      name: "Docx form portrait",
      alias: "docx_form_portrait",
      export_template: `form-portrait.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Form portrait template for docx file"
    },
    {
      name: "Docx form landscape",
      alias: "docx_form_landscape",
      export_template: `form-landscape.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Form landscape template for docx file"
    },
    {
      name: "Pdf form portrait",
      alias: "pdf_form_portrait",
      export_template: `form-portrait.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "pdf",
      description: "Form portrait template for pdf file"
    },
    {
      name: "Pdf form landscape",
      alias: "pdf_form_landscape",
      export_template: `form-landscape.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "pdf",
      description: "Form landscape template for pdf file"
    },
    {
      name: "Docx image view portrait",
      alias: "docx_image_view_portrait",
      export_template: `view_portrait_img_based.docx`,
      js_mapping_script: `try {
const req = await p.getRequest();
const params = req.buildDocumentByTemplParam;
const viewModel = await p.getModel('view');
const viewRecord = await viewModel.findOne({
  alias: params.viewAlias,
});
const image = await viewRecord.getImageBuffer();
const image_base64 = \`data:image/png;base64,\${image.toString('base64')}\`

const img_json = {
  image: image_base64,
  dimensions: {
    width: 733,
    height: 412
  }
}
const img_size = img_json.dimensions.width;

const model = await db.model('model').where({alias: params.modelAlias}).getOne();
const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
const portal_name = await p.getSetting("project_name");
const name = await p.currentUser.getValue('name');
const surname = await p.currentUser.getValue('surname');
const current_user = name + ' ' + surname;
const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();

function calcTime(offset) {
  var d = new Date();
  var utc = d.getTime();
  var nd = new Date(utc + (3600000*offset));
  return nd.toLocaleString();
}
const mapping = { image: img_json, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
return mapping;
} catch (error) {
p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Image view portrait template for docx file"
    },
    {
      name: "Docx image view landscape",
      alias: "docx_image_view_landscape",
      export_template: `view_landscape_img_based.docx`,
      js_mapping_script: `try {
        const req = await p.getRequest();
        const params = req.buildDocumentByTemplParam;
        const viewModel = await p.getModel('view');
        const viewRecord = await viewModel.findOne({
          alias: params.viewAlias,
        });
        const image = await viewRecord.getImageBuffer();
        const image_base64 = \`data:image/png;base64,\${image.toString('base64')}\`
      
        const img_json = {
          image: image_base64,
          dimensions: {
            width: 1000,
            height: 560
          }
        }
        const img_size = img_json.dimensions.width;
      
        const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
        const model = await db.model('model').where({alias: params.modelAlias}).getOne();
        const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
        const portal_name = await p.getSetting("project_name");
        const name = await p.currentUser.getValue('name');
        const surname = await p.currentUser.getValue('surname');
        const current_user = name + ' ' + surname;
      
        
        function calcTime(offset) {
          var d = new Date();
          var utc = d.getTime();
          var nd = new Date(utc + (3600000*offset));
          return nd.toLocaleString();
        }
        const mapping = { image: img_json, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
        return mapping;
      } catch (error) {
        p.response.error(error)
      }`,
      active: true,
      format: "docx",
      description: "Image view landscape template for docx file"
    },
    {
      name: "Pdf image view portrait",
      alias: "pdf_image_view_portrait",
      export_template: `view_portrait_img_based.docx`,
      js_mapping_script: `try {
        const req = await p.getRequest();
        const params = req.buildDocumentByTemplParam;
        const viewModel = await p.getModel('view');
        const viewRecord = await viewModel.findOne({
          alias: params.viewAlias,
        });
        const image = await viewRecord.getImageBuffer();
        const image_base64 = \`data:image/png;base64,\${image.toString('base64')}\`
      
        const img_json = {
          image: image_base64,
          dimensions: {
            width: 733,
            height: 412
          }
        }
        const img_size = img_json.dimensions.width;
      
        const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
        const model = await db.model('model').where({alias: params.modelAlias}).getOne();
        const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
        const portal_name = await p.getSetting("project_name");
        const name = await p.currentUser.getValue('name');
        const surname = await p.currentUser.getValue('surname');
        const current_user = name + ' ' + surname;
      
        
        function calcTime(offset) {
          var d = new Date();
          var utc = d.getTime();
          var nd = new Date(utc + (3600000*offset));
          return nd.toLocaleString();
        }
        const mapping = { image: img_json, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
        return mapping;
      } catch (error) {
        p.response.error(error)
      }`,
      active: true,
      format: "pdf",
      description: "Image view portrait template for pdf file"
    },
    {
      name: "Pdf image view landscape",
      alias: "pdf_image_view_landscape",
      export_template: `view_landscape_img_based.docx`,
      js_mapping_script: `try {
        const req = await p.getRequest();
        const params = req.buildDocumentByTemplParam;
        const viewModel = await p.getModel('view');
        const viewRecord = await viewModel.findOne({
          alias: params.viewAlias,
        });
        const image = await viewRecord.getImageBuffer();
        const image_base64 = \`data:image/png;base64,\${image.toString('base64')}\`
      
        const img_json = {
          image: image_base64,
          dimensions: {
            width: 1000,
            height: 560
          }
        }
        const img_size = img_json.dimensions.width;
      
        const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
        const model = await db.model('model').where({alias: params.modelAlias}).getOne();
        const view = await db.model('view').where({model: model.id, alias: params.viewAlias}).getOne();
        const portal_name = await p.getSetting("project_name");
        const name = await p.currentUser.getValue('name');
        const surname = await p.currentUser.getValue('surname');
        const current_user = name + ' ' + surname;
      
        
        function calcTime(offset) {
          var d = new Date();
          var utc = d.getTime();
          var nd = new Date(utc + (3600000*offset));
          return nd.toLocaleString();
        }
        const mapping = { image: img_json, portal_name: portal_name, view_name: view.name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
        return mapping;
      } catch (error) {
        p.response.error(error)
      }`,
      active: true,
      format: "pdf",
      description: "Image view landscape template for pdf file"
    },
    {
      name: "Docx form portrait with media",
      alias: "docx_form_portrait_with_media",
      export_template: `form-portrait-with-media.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Form portrait template with media for docx file"
    },
    {
      name: "Pdf form portrait with media",
      alias: "pdf_form_portrait_with_media",
      export_template: `form-portrait-with-media.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "pdf",
      description: "Form portrait template with media for pdf file"
    },
    {
      name: "Docx form landscape with media",
      alias: "docx_form_landscape_with_media",
      export_template: `form-landscape-with-media.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "docx",
      description: "Form landscape template with media for docx file"
    },
    {
      name: "Pdf form landscape with media",
      alias: "pdf_form_landscape_with_media",
      export_template: `form-landscape-with-media.docx`,
      js_mapping_script: `try {
  const req = await p.getRequest();
  const params = req.buildDocumentByTemplParam;
  const user_timezone = Math.round(parseInt(req["__headers"].xtimezoneoffset)/60) || params.userTimeZone || new Date().getTimezoneOffset();
  const formXml = await p.utils.getFormRawXML(params.modelAlias, params.recordId, { fields: params.fields, userTimeZone: user_timezone, relatedViews: params.relatedViews });
  const model = await db.model('model').where({alias: params.modelAlias}).getOne();
  const portal_name = await p.getSetting("project_name");
  const name = await p.currentUser.getValue('name');
  const surname = await p.currentUser.getValue('surname');
  const current_user = name + ' ' + surname;

  
  function calcTime(offset) {
    var d = new Date();
    var utc = d.getTime();
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
  }
  const mapping = { form: formXml, portal_name: portal_name, current_user: current_user, model_name: model.name , current_date: calcTime(user_timezone), user_timezone: user_timezone};
  return mapping;
} catch (error) {
  p.response.error(error)
}`,
      active: true,
      format: "pdf",
      description: "Form landscape template with media for pdf file"
    }
  ],
  views: [
    {
      name: "Default",
      alias: "default",
      type: "grid",
      condition_script: "p.currentUser.canAtLeastWrite()",
      layout: "Default",
      filter: "Default",
      __lock: ["delete"]
    }
  ],
  layouts: [
    {
      name: "Default",
      type: "grid",
      options: {
        columns: [
          "id",
          "name",
          "alias",
          "format",
          "active",
          "description",
          "created_at",
          "updated_at"
        ],
        columns_options: {},
        sort_order: [
          { field: "id", type: "descending" },
          { field: "name", type: "none" },
          { field: "alias", type: "none" },
          { field: "format", type: "none" },
          { field: "active", type: "none" },
          { field: "description", type: "none" },
          { field: "created_at", type: "none" },
          { field: "updated_at", type: "none" }
        ],
        wrap_text: false,
        cell_editing: false
      },
      __lock: ["delete"]
    }
  ],
  forms: [
    {
      name: "Default",
      alias: "default",
      order: 0,
      active: true,
      condition_script: "true",
      options: {
        components: {
          list: [
            "__tab__.main",
            "__section__.1",
            "__column__.1_1",
            "name",
            "format",
            "export_template",
            "__column__.1_2",
            "alias",
            "active",
            "__section__.2",
            "js_mapping_script",
            "description",
            "__tab__.service",
            "__section__.3",
            "id",
            "__section__.4",
            "__column__.4_1",
            "created_at",
            "updated_at",
            "__column__.4_2",
            "created_by",
            "updated_by"
          ],
          options: {
            "__tab__.main": { expanded: true, name: "Main" },
            "__tab__.service": { name: "Service" }
          }
        },
        related_components: { list: [], options: {} }
      },
      __lock: ["delete"]
    }
  ],
  permissions: [
    {
      type: "model",
      action: "create",
      script: "p.currentUser.canAtLeastWrite()",
      __lock: ["delete"]
    },
    {
      type: "model",
      action: "update",
      script: "p.currentUser.canAtLeastWrite()",
      __lock: ["delete"]
    },
    {
      type: "model",
      action: "delete",
      script: "p.currentUser.canAtLeastWrite()",
      __lock: ["delete"]
    }
  ]
};
