import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ObjectEditor from "../../../../shared/object-editor";
import Reference from '../../../../shared/inputs/reference';

const AttachmentsEditor = ({ options, onChange }) => {
  const { last_versions_view, previous_versions_view } = options;

  return (
    <ObjectEditor data={options} onChange={onChange}>
      <ObjectEditor.Input name="name" label="Name" as="text" />
      <Reference
        name='Show last versions in view'
        value={last_versions_view}
        config={{
          foreignModel: 'view',
          label: 'name',
          view: 'default',
          form: 'default',
          filter: "model.alias = 'attachment'",
        }}
        inline={false}
        onChange={(_, { value }) => onChange({ last_versions_view: value })}
      />
      <Reference
        name='Show previous versions in view'
        value={previous_versions_view}
        config={{
          foreignModel: 'view',
          label: 'name',
          view: 'default',
          form: 'default',
          filter: "model.alias = 'attachment'",
        }}
        inline={false}
        onChange={(_, { value }) => onChange({ previous_versions_view: value })}
      />
    </ObjectEditor>
  );
};

AttachmentsEditor.propTypes = {
  options: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default AttachmentsEditor;
