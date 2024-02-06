import React from 'react';
import PropTypes from 'prop-types';
import DataVisualField from '../data-visual';
import ProxyRecord from '../../../../../../containers/content/form/proxy-record';
import Sandbox from '../../../../../../sandbox';

const attributes = {
  data_visual: JSON.stringify({ attr: [
    { p: -1, f: 3959 },
    { p: 3959, f: 3960 },
    { p: 3959, f: 3961 },
    { p: 3959, f: 3962 },
  ] }),
};
const metadata = {
  model: { id: 1000, name: "Test", plural: "Tests", alias: "tests" },
  fields: [
    { id: 3941, model: 340, name: "Data visual", alias: "data_visual", type: "data_visual", options: "{\"length\":10000,\"syntax_hl\":\"json\"}", required_when_script: null, hidden_when_script: null, readonly_when_script: null, extra_attributes: [] },
  ],
  uiRules: [],
  extraFieldsAttributes: [],
  relationships: { template_template_ivm_1_3942: { 6: {} } }
};
const record = new ProxyRecord(attributes, metadata);
const sandbox = new Sandbox({ record });
record.__assignSandbox(sandbox);

const props = {
  required: {
    field: { id: 3941, model: 340, name: "Data visual", alias: "data_visual", type: "data_visual", options: "{\"length\":10000,\"syntax_hl\":\"json\"}", required_when_script: null, hidden_when_script: null, readonly_when_script: null, extra_attributes: [] },
    template: {
      metadata: {
        model: { id: 342, name: "Data for template - Template (IVM) #1 (Data template)", plural: "Data for template - Template (IVM) #1 (Data template)", alias: "template_template_ivm_1_3942", type: "template" },
        fields: [
          { id: 3959, model: 342, name: "Folder 1", alias: "folder_1546454467908", type: "string", options: "{\"subtype\":\"folder\"}", required_when_script: "false", hidden_when_script: "false", readonly_when_script: "false", virtual: true },
          { id: 3960, model: 342, name: "Text 1", alias: "text_1546454469881", type: "string", options: "{\"length\":255,\"rows\":1,\"default\":\"\",\"subtype\":\"text\"}", required_when_script: "false", hidden_when_script: "false", readonly_when_script: "false" },
          { id: 3961, model: 342, name: "Text 2", alias: "text_1546454469882", type: "string", options: "{\"length\":255,\"rows\":1,\"default\":\"\",\"subtype\":\"text\"}", required_when_script: "false", hidden_when_script: "false", readonly_when_script: "false" },
          { id: 3962, model: 342, name: "Text 3", alias: "text_1546454469883", type: "string", options: "{\"length\":255,\"rows\":1,\"default\":\"\",\"subtype\":\"text\"}", required_when_script: "false", hidden_when_script: "false", readonly_when_script: "false" },
        ],
        uiRules: [],
        extraFieldsAttributes: []
      },
      options: {
        data_model_id: 342, data_record_id: 6
      }
    },
    componentRenderer: () => <div></div>,
  },
};

const cases = [
  {
    context: { record },
    childContextTypes: { record: PropTypes.object },
    props: {
      value: JSON.stringify({ attr: [
        { p: -1, f: 3959 },
        { p: 3959, f: 3960 },
        { p: 3959, f: 3961 },
        { p: 3959, f: 3962 },
      ] }),
    },
    result: {
      methods: {
        getSection: { output: {"columns": [{"components": [{"columns": [{"components": [{"id": "text_1546454469881", "params": {}}, {"id": "text_1546454469882", "params": {}}, {"id": "text_1546454469883", "params": {}}], "id": "__column__.folder_1546454467908", "params": {}}], "id": "__section__.folder_1546454467908", "params": {"expanded": true, "name": "Folder 1"}}], "id": "__column__.data_visual", "params": {}}], "id": "__section__.data_visual", "params": {"expanded": true}} },
      },
    }
  },
];

new BasicComponentTester(cases, props).test(<DataVisualField />);
