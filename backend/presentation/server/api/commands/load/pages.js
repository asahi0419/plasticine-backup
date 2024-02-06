import { map, groupBy, concat, compact } from 'lodash-es';
import { transform } from '@babel/core';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../../business/logger/index.js';
import { serializer, createFilterByScript } from './helpers.js';
import { logUserActivity } from '../../../../../business/logger/user-activity-logger.js';
import { USER_ACTIVITIES } from './constants.js';

export default async (req, res) => {
  try {
    req.sandbox.addInternalVariable('loadingPagesByApi', true);
    res.json({ data: await loadPages(req.sandbox, req.query.filter) });

    logActivity(req);
  } catch (error) {
    res.error(error);
  }
};

export const loadPages = async (sandbox, filter) => {
  const selector = await db.model('page', sandbox).getSelector();
  const { scope } = await (filter ? selector.getScope(filter) : selector.defaultScope());

  const filterPagesByAccessScript = createFilterByScript('page', 'access_script', sandbox);
  const pages = filterPagesByAccessScript(
    await scope.select(['id', 'name', 'alias', 'access_script', 'component_script', 'server_script', 'template', 'styles'])
  );

  const actions = await loadActions(pages);
  const attachments = await loadAttachments(pages);

  return compact(
    concat(
      pages.map(serializePage),
      serializer(actions, 'action'),
      serializer(attachments, 'attachment'),
    )
  );
};

export const serializePage = ({ id, name, alias, template, styles, component_script, server_script, actions, attachments }) => {
  const page = { id, name, alias, styles, component_script, server_script, actions, attachments };

  try {
    const options = {
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-object-rest-spread']
    };

    page.component_script = transform(`__COMPONENT__ = ${component_script || null}`, options).code;
    page.template = transform(template, options).code;
  } catch (error) {
    console.log(error);
    logger.error(error);
    const message = 'Something wrong was happened. It is likely you have syntax errors in template of the page.';
    page.template = `React.createElement("div", {}, "${message}")`;
  }

  return serializer(page, 'page');
};


async function loadActions(pages) {
  const crossRecords = await loadActionsCrosses(pages);
  const actions = await db.model('action')
    .whereIn('id', map(crossRecords, 'target_record_id'))
    .where({ active: true, __inserted: true });
  const actionsMap = groupBy(crossRecords, 'source_record_id');

  pages.forEach((page) => {
    page.actions = map(actionsMap[page.id], 'target_record_id');
  });

  return actions;
}

async function loadAttachments(pages) {
  const crossRecords = await loadPagesCrosses(pages);
  const attachments = await db.model('attachment')
    .where({ __inserted: true })
    .whereIn('target_record', map(crossRecords, 'id'))
    .select('id', 'file_name');
  const attachmentsMap = groupBy(crossRecords, 'target_record_id');

  pages.forEach((page) => {
    page.attachments = map(attachmentsMap[page.id], 'source_record_id');
  });

  return attachments;
}

async function loadActionsCrosses(pages) {
  const pageModel = db.getModel('page');
  const field = db.getField({ model: pageModel.id, alias: 'actions' });

  return db.model('rtl')
    .where({ source_field: field.id })
    .whereIn('source_record_id', map(pages, 'id'))
    .select('source_record_id', 'target_record_id');
}

async function loadPagesCrosses(pages) {
  const pageModel = db.getModel('page');

  return db.model('global_references_cross')
    .where({ target_model: pageModel.id })
    .whereIn('target_record_id', map(pages, 'id'));
}

async function logActivity(request) {
  if(request.query.filter && request.query.filter === "alias = 'change_password'"){
    await logUserActivity({
      user:request.user,
      headers: request.headers,
      url:request.originalUrl,
      activity : USER_ACTIVITIES.Page});
  }
}
