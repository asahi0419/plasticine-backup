import PDFMerger from 'pdf-merger-js';
import { fromBuffer } from 'pdf2pic'
import PDFDocument from 'pdfkit';
import PDFParser from "pdf2json";
import getStream from 'get-stream';

import logger from '../../../../logger/index.js';
import RecordProxy from '../../model/record/index.js';

export const lockPdf = async (pdfBuffer) => {
  let width, height;
  const getPdfLayout = (pdfBuffer) => {
    let pdfParser = new PDFParser();
    pdfParser.parseBuffer(pdfBuffer);
    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError) );
      pdfParser.on("pdfParser_dataReady", pdfData => {
        if (pdfData.hasOwnProperty("Pages") && pdfData.Pages.length > 0) {
          const page = pdfData.Pages[0];
          width = page.Width * 24;
          height = page.Height * 24;
          resolve();
        } else {
          reject('No Pages Data in pdf parsed data.');
        }
      });
    })
  }
  let convertJson;
  try {
    await getPdfLayout(pdfBuffer);
    convertJson = {
      options: {
        density: 300,
        quality: 75,
        format: "jpeg",
        width: width * 1.5,
        height: height * 1.5
      },
      isBase64: true,
      pageNumber: -1
    };
  } catch (err) {
    convertJson = {
      options: {
        density: 300,
        quality: 75,
        format: "jpeg",
      },
      isBase64: true,
      pageNumber: -1
    };
  }

  let pdfArray = await fromBuffer(pdfBuffer, convertJson.options).bulk(convertJson.pageNumber, convertJson.isBase64);

  let doc = new PDFDocument({
      autoFirstPage: false
  });

  for (let i = 0; i < pdfArray.length; i++) {
      let [width, height] = pdfArray[i].size.split('x');
      doc.addPage({
        size: [Number(width), Number(height)]
      });
      doc.image(`data:image/jpeg;base64,${pdfArray[i].base64}`, 0, 0);
  }
  doc.end();
  return await getStream.buffer(doc);
}

export default (sandbox) => async (template = {}, data = {}, options = {}) => {
  try {
    const fileName = options.fileName ? `${options.fileName}.pdf` : `generated_${+new Date()}.pdf`;
    const dataItems = Array.isArray(data) ? data : [data];

    const merger = new PDFMerger();
    await Promise.all(dataItems.map(async (item) => {
      const docx = await sandbox.vm.utils.buildDocxByTemplate(template, item, { ...options, mode: 'attachment'});
      const pdf = await sandbox.vm.utils.convertAttachment(docx, 'pdf');
      const lockedPdfBuffer = await lockPdf(pdf.buffer);
      merger.add(lockedPdfBuffer);
    }));

    const buffer =  await merger.saveAsBuffer();
    if (options.mode === 'buffer') return buffer
    const record = await RecordProxy.create({ file_name: fileName }, 'attachment', sandbox);

    return record.setBuffer(buffer);
  } catch (error) {
    logger.error(error);
  }
};
