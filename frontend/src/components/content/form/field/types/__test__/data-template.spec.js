import React from 'react';
import { Icon } from 'semantic-ui-react';
import DataTemplateField from '../data-template';

const props = {
  required: {
    field: { alias: 'test', options: '{"subtype":"folder"}' },
    configs: { templates: [] },
    fields: [{ alias: 'name' }, { alias: 'required_when_script' }, { alias: 'options' }],
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
  },
};

const cases = [
  {
    props: {
      value: undefined,
    },
    result: {
      state: { items: [], selected: {} },
      render: ['.field.data-template', '.segment.content', '.divider', '.tree'],
    },
  },
  {
    props: {
      value: JSON.stringify({ attr: [] }),
    },
    result: {
      state: { items: [], selected: {} },
      render: ['.field.data-template', '.segment.content', '.divider', '.tree'],
    },
  },
  {
    props: {
      value: JSON.stringify({ attr: [
        { p: -1, f: 1 },
        { p: 1, f: 2 },
        { p: 2, f: 3 },
        { p: 3, f: 4 },
        { p: -1, f: 5 },
      ] }),
      fields: [
        { id: 1, alias: 'folder_1', name: 'Folder 1', options: '{"subtype":"folder"}', virtual: true },
        { id: 2, alias: 'folder_2', name: 'Folder 2', options: '{"subtype":"folder"}', virtual: true },
        { id: 3, alias: 'folder_3', name: 'Folder 3', options: '{"subtype":"folder"}', virtual: true },
        { id: 4, alias: 'check_1', name: 'Check 1', options: '{"subtype":"check"}', },
        { id: 5, alias: 'text_1', name: 'Text 2', options: '{"subtype":"text"}', },
      ],
    },
    result: {
      state: {
        items: [{"alias": "folder_1", "children": [{"alias": "folder_2", "children": [{"alias": "folder_3", "children": [{"alias": "check_1", "disabled": false, "icon": <Icon as="i" name="dot circle outline" />, "id": 4, "key": "check_1", "name": "Check 1", "options": "{\"subtype\":\"check\"}", "parent": 3, "subtype": "check", "title": "Check 1 (check)"}], "disabled": false, "icon": <Icon as="i" name="folder outline" />, "id": 3, "key": "folder_3", "name": "Folder 3", "options": "{\"subtype\":\"folder\"}", "parent": 2, "subtype": "folder", "title": "Folder 3 (folder)", "virtual": true}], "disabled": false, "icon": <Icon as="i" name="folder outline" />, "id": 2, "key": "folder_2", "name": "Folder 2", "options": "{\"subtype\":\"folder\"}", "parent": 1, "subtype": "folder", "title": "Folder 2 (folder)", "virtual": true}], "disabled": false, "icon": <Icon as="i" name="folder outline" />, "id": 1, "key": "folder_1", "name": "Folder 1", "options": "{\"subtype\":\"folder\"}", "parent": -1, "subtype": "folder", "title": "Folder 1 (folder)", "virtual": true}, {"alias": "text_1", "disabled": false, "icon": <Icon as="i" name="font" />, "id": 5, "key": "text_1", "name": "Text 2", "options": "{\"subtype\":\"text\"}", "parent": -1, "subtype": "text", "title": "Text 2 (text)"}],
        selected: {"alias": "folder_1", "children": [{"alias": "folder_2", "children": [{"alias": "folder_3", "children": [{"alias": "check_1", "disabled": false, "icon": <Icon as="i" name="dot circle outline" />, "id": 4, "key": "check_1", "name": "Check 1", "options": "{\"subtype\":\"check\"}", "parent": 3, "subtype": "check", "title": "Check 1 (check)"}], "disabled": false, "icon": <Icon as="i" name="folder outline" />, "id": 3, "key": "folder_3", "name": "Folder 3", "options": "{\"subtype\":\"folder\"}", "parent": 2, "subtype": "folder", "title": "Folder 3 (folder)", "virtual": true}], "disabled": false, "icon": <Icon as="i" name="folder outline" />, "id": 2, "key": "folder_2", "name": "Folder 2", "options": "{\"subtype\":\"folder\"}", "parent": 1, "subtype": "folder", "title": "Folder 2 (folder)", "virtual": true}], "disabled": false, "icon": <Icon as="i" name="folder outline" />, "id": 1, "key": "folder_1", "name": "Folder 1", "options": "{\"subtype\":\"folder\"}", "parent": -1, "subtype": "folder", "title": "Folder 1 (folder)", "virtual": true},
      },
      render: ['.field.data-template', '.segment.content', '.divider', '.details', '.control-buttons', '.tree'],
    },
  },
];

new BasicComponentTester(cases, props).test(<DataTemplateField />);
