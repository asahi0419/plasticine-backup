import PizZip from 'pizzip';
import sizeOf from 'image-size';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import { forOwn, isObject, isArray, assign } from 'lodash-es';
import expressions from "angular-expressions";

import { ParamsNotValidError } from '../../error/index.js';

// define your filter functions here, for example
// to be able to write {clientname | lower}
expressions.filters.lower = function (input) {
    // Make sure that if your input is undefined, your
    // output will be undefined as well and will not
    // throw an error
    if (!input) return input;
    return input.toLowerCase();
};
function angularParser(tag) {
    tag = tag
        .replace(/^\.$/, "this")
        .replace(/(’|‘)/g, "'")
        .replace(/(“|”)/g, '"');
    const expr = expressions.compile(tag);
    return {
        get: function (scope, context) {
            let obj = {};
            const scopeList = context.scopeList;
            const num = context.num;
            for (let i = 0, len = num + 1; i < len; i++) {
                obj = assign(obj, scopeList[i]);
            }
            return expr(scope, obj);
        },
    };
}

export default class DOCXByTemplateBuilder {
  constructor(templateAttachment, sandbox) {
    this.templateAttachment = templateAttachment;
  }

  async build(data, options) {
    let buffer;
    if (Buffer.isBuffer(this.templateAttachment)) { 
      buffer = this.templateAttachment;
    } else {
      buffer = await this.templateAttachment.getBuffer();
    }

    const isBase64 = (dataURL) => {
      const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
      if (!base64Regex.test(dataURL)) {
        return false;
      }
      return true;
    };

    const base64DataURLToArrayBuffer = (dataURL) => {
      const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
      if (isBase64(dataURL)) {
        const stringBase64 = dataURL.replace(base64Regex, "");
        return Buffer.from(stringBase64, 'base64')
      }
      return false;
    };

    const parseTemplateParms = (data, imageDimensions={height : 300, width: 300}) => {
      let parsed = {}
      forOwn(data, (val, key) => {
        if (isBase64(val)) {
          const buffer = base64DataURLToArrayBuffer(val);
          imageDimensions = sizeOf(buffer);
          parsed[key] = val;
        }
        else if (isObject(val)) {
          if (isArray(val)) {
            parsed[key] = []
            val.forEach((loopItem) => {
              parsed[key].push(parseTemplateParms(loopItem, imageDimensions)["prepearedData"])
            })
          } else {
            imageDimensions = val.dimensions;
            parsed[key] = val.image;
          }
        }
        else {
          parsed[key] = val;
        }
      });
      return { prepearedData: parsed, imageDimensions: imageDimensions}
    }

    let prepearedData = {};
    let imageDimensions = options.imageDimensions;
    const parsed = parseTemplateParms(data, imageDimensions)
    prepearedData = parsed.prepearedData
    imageDimensions = parsed.imageDimensions

    const imageOpts = {
      fileType: 'docx',
      centered: false,
      getImage(tagValue, tagName) {
        return base64DataURLToArrayBuffer(tagValue);
      },
      getSize(img, tagValue, tagName) {
        const maxWidth = imageDimensions.width;
        const maxHeight = 540;
        try {
          const sizeObj = sizeOf(img);
          const widthRatio = sizeObj.width / maxWidth;
          const heightRatio = sizeObj.height / maxHeight;
          if (widthRatio < 1 && heightRatio < 1) {
              /*
               * Do not scale up images that are
               * smaller than maxWidth,maxHeight
               */
              return [sizeObj.width, sizeObj.height];
          }
          let finalWidth, finalHeight;
          if (widthRatio > heightRatio) {
              /*
               * Width will be equal to maxWidth
               * because width is the most "limiting"
               */
              finalWidth = maxWidth;
              finalHeight = sizeObj.height / widthRatio;
          } else {
              /*
               * Height will be equal to maxHeight
               * because height is the most "limiting"
               */
              finalHeight = maxHeight;
              finalWidth = sizeObj.width / heightRatio;
          }
          return [Math.round(finalWidth), Math.round(finalHeight)];
        } catch (err) {
          return [200, 200]
        }

      },
    };


    let module = new ImageModule(imageOpts);
    const zip = new PizZip(buffer);

    const doc = new Docxtemplater();
    doc.attachModule(module)
    doc.loadZip(zip)
    doc.setOptions({
      paragraphLoop: true,
      parser: angularParser
    })
    doc.setData(prepearedData);

    try {
      doc.render();
    } catch (e) {
      let msg = `${e.name}${e.message}`;
      if (e.properties && e.properties.errors) {
        e.properties.errors.forEach(function (err) {
          const delimiter = '  '
          msg += `${delimiter}${err}`;
        });
      }
      throw new ParamsNotValidError(`Not valid template params - ${msg}`);
    }
    return doc.getZip().generate({type: 'nodebuffer', compression: "DEFLATE"});
  }
}
