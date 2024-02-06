import qs from 'qs';
import puppeteer from 'puppeteer';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import imageToAttachmentFunction from '../image-to-attachment.js';
import { ParamsNotValidError } from '../../../../error/index.js';

const DEFAULT_TYPE = 'png';
const DEFAULT_OPTIONS = { file_name: `chart.${DEFAULT_TYPE}`, type: DEFAULT_TYPE };

export default (sandbox) => async (alias, options = DEFAULT_OPTIONS) => {
  if (!alias) throw new ParamsNotValidError(`Missing parameter 'alias' in chartToAttachment(...)`);
  if (!options.type) throw new ParamsNotValidError(`Missing parameter 'options.type' in chartToAttachment(...)`);

  const chart = await db.model('chart').where({ alias }).getOne();
  if (!chart) throw new RecordNotFoundError();

  const admin = sandbox.context.request.app.sandbox.user.account;
  const host = `http://${process.env.SERVICE_FRONTEND_HOST}:${process.env.SERVICE_FRONTEND_PORT}`;
  const url = `${host}/chart/form/${chart.id}`;
  const query = qs.stringify({ token: admin.static_token });

  let browser;

  try {
    browser = await puppeteer.launch({
      args: ['--use-gl=swiftshader', '--disable-dev-shm-usage', '--no-sandbox'],
      defaultViewport: { height: 1080, width: 1920 },
    });
    const page = await browser.newPage();
    await page.goto(`${url}?${query}`);
    await page.waitForSelector('.chart .button');
    await page.evaluate('document.querySelector(".chart .button").click()');
    await page.waitForSelector('svg');

    const script = getScript(chart, options);
    const dataURL = await page.evaluate(script);
    await browser.close();

    const [ meta, base64 ] = dataURL.split(',');
    return imageToAttachmentFunction(sandbox)(base64, options);
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    logger.error(error);
  }
};

function getScript(chart, options) {
  if (chart.version === 'v4') {
    return `new Promise((resolve) => {
  const getImage = async () => chart.exporting.getImage('${options.type}').then(resolve);
  chart.isReady() ? getImage() : chart.events.on('ready', getImage);
})`;
  }

  if (chart.version === 'v5') {
    return `new Promise((resolve) => {
  let timeout;
  chart.events.on("frameended", exportChart);

  function exportChart() {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(function() {
      chart.events.off("frameended", exportChart);
      chart.exporting.exportImage('${options.type}').then(resolve)
    }, 100)
  }
})`;
  }
}