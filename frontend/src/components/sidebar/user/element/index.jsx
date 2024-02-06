import React from 'react';

import View from './view';
import Dashboard from './dashboard';
import Page from './page';
import Record from './record';
import Action from './action';
import URL from './url';

export default (component = {}, context = {}) => {
  const { id, params = {} } = component
  
  if (/^__view__./.test(id)) {
    return (
      <View
        params={params}
        models={context.models}
        views={context.views}
      />
    );
  }

  if (/^__dashboard__./.test(id)) {
    return (
      <Dashboard
        params={params}
        dashboards={context.dashboards}
      />
    );
  }

  if (/^__page__./.test(id)) {
    return (
      <Page
        params={params}
        pages={context.pages}
      />
    );
  }

  if (/^__record_new__./.test(id)) {
    return (
      <Record
        params={params}
        models={context.models}
        createNew={true}
      />
    );
  }

  if (/^__record_show__./.test(id)) {
    return (
      <Record
        params={params}
        models={context.models}
      />
    );
  }

  if (/^__action__./.test(id)) {
    return (
      <Action
        params={params}
        model={context.model}
        record={context.record}
        actions={context.actions}
        handleAction={context.handleAction}
      />
    );
  }

  if (/^__url__./.test(id)) {
    return (
      <URL
        params={params}
      />
    );
  }
};
