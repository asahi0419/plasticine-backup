/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const page = find(SEED.records, { alias: 'layout' }) || {};

  await HELPERS.updateRecord(knex, 'page',
    { alias: 'layout' },
    { template: `<div className="layout">
  <Background active={page.state.activeBackground} />
  {p.getPageElement('header_container', { layoutMode: page.state.layoutMode, readyComponents: page.props.readyComponents })}
  {p.getPageElement('sidebar_container', { styles: page.getStyles().sidebar })}
  {p.getPageElement('content_container', { styles: page.getStyles().content, children: page.props.children })}
</div>` }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
