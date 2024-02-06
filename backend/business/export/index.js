export { default as CSVBuilder } from './csv/builder.js';
export { default as PDFBuilder } from './pdf/builder.js';
export { default as XLSXBuilder } from './xlsx/builder.js';
export { default as DOCXByTemplateBuilder } from './docx/by-template-builder.js';

export default (data, builder, options) => builder.build(data, options);
