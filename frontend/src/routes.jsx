import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';

import App from './containers/app';
import LayoutContainer from './containers/layout';
import RootContainer from './containers/content/root';
import DashboardContainer from './containers/content/dashboard';
import ViewContainer from './containers/content/view';
import FormContainer from './containers/content/form';
import PageContainer from './containers/content/page';
import requireAuth from './components/hoc/require-auth';
import makeEmbeddable from './components/hoc/make-embeddable';

export default (
  <Route path="/" component={App}>
    <Route component={requireAuth(makeEmbeddable(LayoutContainer))}>
      <IndexRoute component={RootContainer} />
      <Route path="/:modelAlias/view/:viewType/:viewAlias" component={ViewContainer} />
      <Route path="/:modelAlias/form/:recordId" component={FormContainer} />
      <Route path="/:modelAlias/form/new/:recordId" component={FormContainer} />
      <Route path="/:modelAlias/privileges" component={PageContainer} />
      <Route path="/dashboard/:dashboardAlias" component={DashboardContainer} />
      <Route path="/dashboard" component={DashboardContainer} />
    </Route>

    <Route path="/pages/:pageAlias" component={PageContainer} />
    <Route path="/pages/:pageAlias/:tutorialPermalink/:articlePermalink" component={PageContainer} />
    <Route path="/pages/:pageAlias/:tutorialPermalink" component={PageContainer} />
    <Redirect from="*" to="/pages/404" />
  </Route>
);
