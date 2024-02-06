import React, { Component } from 'react';

import Header from './header';
import Content from './content';

export default (tab, dashboard, dataToRelate, editable, removable, onRemove, onChange) => ({
  menuItem: (
    <Header
      key={tab.id}
      tab={tab}
      editable={editable}
      removable={removable}
      dataToRelate={dataToRelate}
      onRemove={onRemove}
      onChange={onChange}
    />
  ),
  render: () => {
    return (
      <Content
        dashboard={dashboard}
        tab={tab}
      />
    );
  },
});
