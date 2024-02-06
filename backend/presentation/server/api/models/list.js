import { isUndefined, isObject, isNull, isEmpty } from 'lodash-es';
import qs from 'qs';

import db from '../../../../data-layer/orm/index.js';
import Fetcher from '../../../../business/record/fetcher/index.js';
import RecordProxy from '../../../../business/sandbox/api/model/record/index.js';
import * as SETTING from '../../../../business/setting/index.js';
import * as HELPERS from '../../../../business/helpers/index.js';
import { RecordNotFoundError } from '../../../../business/error/index.js';
import stream from 'stream'

const EXPORT_XLSX_MAX_CELLS = 600000;

export default async (req, res) => {
  try {
    const options = await getOptions(req);
    validateOptions(req, options);

    if (req.format === 'geojson') {
      const { exec_by = {}, filter, hidden_filter } = options;

      const view = await db.model('view').where({ model: req.model.id, alias: exec_by.alias }).getOne();
      const viewProxy = await RecordProxy.create(view, db.getModel('view'), req.sandbox);

      const appearance = await db.model('appearance').where({ id: view.appearance }).getOne();
      const appearanceOptions = HELPERS.parseOptions(appearance.options);
      const no_cache = appearanceOptions['no-cache'];

      const method = (filter || hidden_filter || no_cache) ? 'produce' : 'resolve'
      const data = await viewProxy[`${method}Data`](options, { compress: !no_cache, validate: false });

      if (no_cache) return res.json(data);

      const gzip = Buffer.from(data, 'base64');
      res.writeHead(200, {
       'Content-Type': 'application/x-gzip',
       'Content-Length': gzip.length
      });
      res.end(gzip);
    } else if (['docx', 'pdf'].includes(req.format)) {
      let result
      if (!isEmpty(options.exportType)) {
        if (options.exportType === 'form') {
          const fetched = await new Fetcher(req.model, req.sandbox, options).fetch();
          if(isEmpty(fetched.records)) {
            throw new RecordNotFoundError()
          }
          // TODO: generate form docx/pdf file using buildDocumentByTemplate
          const orientation = options.orientation? options.orientation : 'landscape'
          let mediaColsCount = 2
          if (orientation == 'landscape') {
              mediaColsCount = 4
          }
          const relatedViews = qs.parse(req.query.relatedViews)
          result = await req.sandbox.vm.p.utils.buildDocumentByTemplate(`${req.format}_form_${orientation}_with_media`, { modelAlias: req.model.alias, recordId: fetched.records[0].id, mediaColumnsCount: mediaColsCount, fields: options.fieldOptions, mode: 'buffer', relatedViews: relatedViews || {}, orientation})
        }
      } else {
        const { viewAlias='default', orientation='landscape' } = options.pdfDocxParams
        const view = await db.model('view').where({ model: req.model.id, alias: viewAlias }).getOne()
        if (!view) throw new ViewNotFoundError()
        switch (true) {
          case view.type === 'grid':
            result = await req.sandbox.vm.p.utils.buildDocumentByTemplate(`${req.format}_grid_view_${orientation}`, { modelAlias: req.model.alias, viewAlias: viewAlias, mode: 'buffer' })
            break
          case ['map', 'topology', 'chart'].includes(view.type):
            result = await req.sandbox.vm.p.utils.buildDocumentByTemplate(`${req.format}_image_view_${orientation}`, { modelAlias: req.model.alias, viewAlias: viewAlias, mode: 'buffer' })
            break
        }
      }


      if (!result.hasOwnProperty('buffer') || !result.hasOwnProperty('fileName') || !result.hasOwnProperty('format')) throw new Error('Failed to export file')
      const buffer = result.buffer
      const fileName = result.fileName || `download.${result.format}`
      const contentType = result.format === "docx"? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/pdf'
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.length);

      var bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(res)
    } else {
      const result = await new Fetcher(req.model, req.sandbox, options).fetch();
      res.serialize(result);
    }
  } catch (error) {
    res.error(error);
  }
};

export async function getOptions(req = {}) {
  const options = { exec_by: {}, humanize: false, full_set: false, load_extra_fields: false, ...req.query };
  const { page = {}, embedded_to } = options;

  if (['json', 'geojson'].includes(req.format)) {
    const pageSize = isUndefined(page.size) ? SETTING.getSetting('limits.query_iterator') : +page.size;
    const pageSizeLimit = SETTING.getSetting('limits.query_iterator_max');
    options.page = { ...page, size: (pageSize > pageSizeLimit) ? pageSizeLimit : pageSize };
  }

  if (['csv', 'xlsx'].includes(req.format)) {
    const pageSize = isUndefined(page.size) ? SETTING.getSetting('limits.query_iterator') : +page.size;
    const pageSizeLimit = SETTING.getSetting('limits.export_records_max');
    options.page = { ...page, size: (pageSize > pageSizeLimit) ? pageSizeLimit : pageSize, number: 1 };
  }

  if (isObject(embedded_to)) {
    const model = db.getModel(embedded_to.model, { silent: true });
    const record = (model && embedded_to.record_id) ? await db.model(model.alias).where({ id: embedded_to.record_id }).getOne() : null;
    embedded_to.model = model ? model.id : null;
    embedded_to.record_id = record ? record.id : null;
  }

  options.humanize = ['true', true].includes(options.humanize);

  return options;
}

export async function validateOptions(req = {}, options = {}) {
  const { model = {}, sandbox = { translate: () => {} } } = req;
  const { page = {}, fields = {}, embedded_to } = options;

  if (req.format === 'xlsx') {
    const aliases = (fields[`_${model.alias}`] || '').split(',');
    const cells = page.size * aliases.length;

    if (cells > EXPORT_XLSX_MAX_CELLS) {
      const message = sandbox.translate('static.export_maximum_cells_limit', { model: model.plural, limit: EXPORT_XLSX_MAX_CELLS, limit_trunc: Math.trunc(EXPORT_XLSX_MAX_CELLS / page.size) });
      throw new Error(message);
    }
  }

  if (embedded_to) {
    if (!isObject(embedded_to)) throw new Error(`embedded_to should be an object`);
    if (isNull(embedded_to.model)) throw new Error(`embedded_to.model not found`);
    if (isNull(embedded_to.record_id)) throw new Error(`embedded_to.record_id not found`);
  }
}
