import qs from 'qs';
import moment from 'moment';
import puppeteer from 'puppeteer';
import { isObject } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import Sandbox from '../../../../sandbox/index.js';
import RecordProxy from './index.js';
import processMapAppearance from '../../../../appearance/map/index.js';
import * as ERROR from '../../../../error/index.js';
import * as SETTING from '../../../../setting/index.js';
import * as HELPERS from '../../../../helpers/index.js';

export default class ViewProxy extends RecordProxy {
  async produceData(params = {}, options = {}) {
    await validateParams(params, options);

    let result = {
      data: {
        features: [],
        sections: [],
        groups: [],
      },
    };

    if (this.record.appearance) {
      const model = db.getModel(this.record.model);

      const appearanceModel = await this.sandbox.vm.p.getModel('appearance');
      const appearance = await appearanceModel.findOne({ id: parseInt(this.record.appearance) }).raw();

      const builtParams = buildParams(params, this.record);
      const sandbox = await Sandbox.create({
        user: this.sandbox.context.user,
        request: { ...this.sandbox.context.request, query: builtParams }
      }, 'base', this.sandbox.vm);
      
      const parentModel = this.getParentModel();
      const parentRecord = this.getParentRecord();

      if (parentModel && parentRecord) {
        await sandbox.assignRecord(parentRecord, parentModel, 'parentRecord', { preload_data: false });
      }

      result = await processMapAppearance(model, appearance, builtParams, sandbox);
    }

    return options.compress ? HELPERS.gzip(result, { encoding: 'base64' }) : result;
  }

  async resolveData(params = {}, options = {}) {
    await validateParams(params, options);

    const attributesBase = createCacheAttributes(params, this);
    const model = `${this.record.type}_${this.model.alias}_cache`;
    const record = await db.model(model).where(attributesBase).getOne();

    if (record
    && (record.status === 'ready')
    && (moment(record.expiry_date).format() > moment().format())) return record.data;

    const attributes = {
      status: 'ready',
      expiry_date: getCacheExpiryDate(params, this),
      data: await this.produceData(params, options),
    };

    record
      ? db.model(model, this.sandbox).updateRecord(record, attributes)
      : db.model(model, this.sandbox).createRecord({ ...attributesBase, ...attributes });

    return attributes.data;
  }

  async rebuildCache(params = {}, options = {}) {
    await validateParams(params, options);

    const attributesBase = createCacheAttributes(params, this);
    const model = `${this.record.type}_${this.model.alias}_cache`;
    const record = await db.model(model).where(attributesBase).getOne();

    const attributes = {
      status: 'preparation',
      expiry_date: getCacheExpiryDate(params, this),
      rebuild_at: new Date(),
    };

    record
      ? db.model(model, this.sandbox).updateRecord(record, attributes)
      : db.model(model, this.sandbox).createRecord({ ...attributesBase, ...attributes });

    return true;
  }

  async rebuildCacheAsync(...args) {
    try {
      return this.rebuildCache(...args);
    } catch (error) {
      logger.error(`${this.model.name} ${this.record.id} has no ability to request a cache because of ${error.description}`);
      return false;
    }
  }

  async getImageBuffer(params = {}, options = {}) {
    await validateParams(params, options);

    if (!['map', 'topology', 'chart'].includes(this.record.type)) {
      throw new Error('Not implemented yet');
    }

    const host = `http://${process.env.SERVICE_FRONTEND_HOST}:${process.env.SERVICE_FRONTEND_PORT}`;
    const model = db.getModel(this.record.model);
    const alias = this.record.alias;
    const url = `${host}/${model.alias}/view/${this.record.type}/${alias}`;
    const query = qs.stringify({
      embedded_to: params.embedded_to,
      export: true,
      type: 'png',
      token: this.sandbox.user.account.static_token,
    });

    let browser;
    browser = await puppeteer.launch({
      args: [ '--use-gl=swiftshader', '--disable-dev-shm-usage', '--no-sandbox' ],
      defaultViewport: { height: 1080, width: 1920 },
    });
    const page = await browser.newPage();

    switch (this.record.type) {
      case 'map':
        try {
          await page.goto(`${url}?${query}`);
          await page.waitForSelector('.map-image', { timeout: 60000 });
          const dataURL = await page.evaluate('document.querySelector(".map-image").getAttribute("src")');
          await browser.close();
    
          const [ meta, base64 ] = dataURL.split(',');
          return Buffer.from(base64, 'base64');
        } catch (error) {
          if (browser) {
            await browser.close();
          }
    
          logger.error(error);
        }
        break;
      case 'chart':
        try {
          await page.goto(`${url}?${query}`);
          // await page.waitForSelector('div.chart div', { timeout: 60000 });
          await page.waitForTimeout(25000);

          const dataURL = await page.$eval('div.chart div', async (el) => {
            var svgToPng = function (svgText, margin) {
              // convert an svg text to png using the browser
              return new Promise(function(resolve, reject) {
                try {
                  // can use the domUrl function from the browser
                  var domUrl = window.URL || window.webkitURL || window;
                  if (!domUrl) {
                    throw new Error("(browser doesnt support this)")
                  }
                  // figure out the height and width from svg text
                  var match = svgText.match(/height=\"(\d+)/m);
                  var height = match && match[1] ? parseInt(match[1],10) : 200;
                  var match = svgText.match(/width=\"(\d+)/m);
                  var width = match && match[1] ? parseInt(match[1],10) : 200;
                  margin = margin || 0;
                  // it needs a namespace
                  if (!svgText.match(/xmlns=\"/mi)){
                    svgText = svgText.replace ('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ') ;  
                  }
                  // create a canvas element to pass through
                  var canvas = document.createElement("canvas");
                  canvas.width = width + margin*2;
                  canvas.height = height + margin*2;
                  var ctx = canvas.getContext("2d");
                  // make a blob from the svg
                  var svg = new Blob([svgText], {
                    type: "image/svg+xml;charset=utf-8"
                  });
                  
                  var reader = new FileReader();
                  reader.readAsDataURL(svg);
                  
                  let svgDataURL;
                  reader.onload = function(e) {
                      svgDataURL = e.target.result;
                      // create a new image to hold it the converted type
                      var img = new Image;
                      // when the image is loaded we can get it as base64 url
                      img.onload = function() {
                        // draw it to the canvas
                        ctx.drawImage(this, margin, margin, canvas.width, canvas.height);
                        // now we can resolve the promise, passing the base64 url
                        try {
                          resolve(canvas.toDataURL());
                        } catch (e) {
                          resolve(e)
                        }
                      };
                      img.src = svgDataURL;
                  }

                } catch (err) {
                  reject('failed to convert svg to png ' + err);
                }
              });
            };
            const svg = el.innerHTML
            const base64DataURL = svgToPng(svg)
            return base64DataURL
          });

          await browser.close();

          const [ meta, base64 ] = dataURL.split(',');
          return Buffer.from(base64, 'base64');
        } catch (error) {
          if (browser) {
            await browser.close();
          }
          logger.error(error);
        }
        break;
      case 'topology':
        try {
          await page.goto(`${url}?${query}`);
          await page.waitForSelector('canvas[data-id="layer2-node"]', { timeout: 60000 });
          const dataURL = await page.$eval('canvas[data-id="layer2-node"]', el => el.toDataURL());
          await browser.close();

          const [ meta, base64 ] = dataURL.split(',');
          return Buffer.from(base64, 'base64');
        } catch (error) {
          if (browser) {
            await browser.close();
          }
    
          logger.error(error);
        }
        break;
      default:
        await browser.close();
        break;
    }
  }
}

async function validateParams(params = {}, options = { validate: true }) {
  if (!options.validate) return;

  if (!isObject(params)) throw new ERROR.ParamsNotValidError(`params should be an object`);
  if (!isObject(params.embedded_to) && params.embedded_to) throw new ERROR.ParamsNotValidError(`params.embedded_to should be an object`);
  if (params.embedded_to) {
    const model = db.getModel(params.embedded_to.model, { silent: true });
    if (!model) throw new ERROR.ParamsNotValidError(`params.embedded_to.model not found`);
    const record = await db.model(model.alias).where({ id: params.embedded_to.record_id || 0, __inserted: true }).getOne();
    if (!record) throw new ERROR.ParamsNotValidError(`params.embedded_to.record_id not found`);

    params.embedded_to.model = model.id;
    params.embedded_to.record_id = record.id;
  }
}

function createCacheAttributes(params = {}, context = {}) {
  const attributes = { [`${context.model.alias}_id`]: context.record.id };

  if (params.embedded_to) {
    attributes.parent_model = params.embedded_to.model;
    attributes.parent_id = params.embedded_to.record_id;
  } else {
    attributes.parent_model = null;
    attributes.parent_id = null;
  }

  return attributes;
}

function getCacheExpiryDate(params = {}, context = {}) {
  if (params.expire_in) return params.expire_in;

  const expirySettingPath = `data_store_periods.cache.${context.model.alias}.${context.record.type}`;
  const expiryHours = SETTING.getSetting(expirySettingPath) || 48;
  const expiryDate = moment().add(expiryHours, 'hours').toDate();

  return expiryDate;
}

function buildParams(params = {}, record = {}) {
  return {
    humanize: true,
    full_set: false,
    load_extra_fields: false,
    loadCount: 'true',
    autorefresh: { rate: '0' },
    page: { size: 1000 },
    ...params,
    appearance_id: record.appearance,
    exec_by: {
      type: record.type,
      alias: record.alias,
      name: record.name,
      ...(params.exec_by || {}),
    }
  }
}
