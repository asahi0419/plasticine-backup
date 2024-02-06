export const DATE_FORMATS = [
  'global_date_format',
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DD HH:mm',
  'YYYY-MM-DD',
  'DD/MM/YYYY HH:mm:ss',
  'DD/MM/YYYY HH:mm',
  'DD/MM/YYYY',
  'MM/DD/YYYY HH:mm:ss',
  'MM/DD/YYYY HH:mm',
  'MM/DD/YYYY',
  'DD-MM-YYYY HH:mm:ss',
  'DD-MM-YYYY HH:mm',
  'DD-MM-YYYY',
  'DD MMM YYYY HH:mm:ss',
  'DD MMM YYYY HH:mm',
  'DD MMM YYYY',
];

export const DATE_INTERVALS = [
  'Today', 'Yesterday', 'Tomorrow',
  'This week', 'Last week', 'Next week',
  'This month', 'Last month', 'Next month',
  'This quarter', 'Last quarter', 'Next quarter',
  'This year', 'Last year', 'Next year'
];

export const GLOBAL_DATE_FORMAT = DATE_FORMATS[0]
export const ISO_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const DEFAULT_DATE_FORMAT = DATE_FORMATS[1];
export const DEFAULT_DATE_ONLY_FORMAT = DATE_FORMATS[3];
export const DATE_ONLY_FORMATS = [DATE_FORMATS[3], DATE_FORMATS[6], DATE_FORMATS[9], DATE_FORMATS[12], DATE_FORMATS[15]];

export const DEFAULT_AUDIT_TEXT_PATTERN = "Field '${related_field}' changed from '${from}' to '${to}'";
export const DEFAULT_AUDIT_TEXT_LIMIT = 100;

export const EXPORT_XLSX_MAX_CELLS = 600000;

export const UI_ACTION_NAME_LEN = 15;
export const UI_ACTION_MENU_NAME_LEN = 35;
export const UI_VIEW_NAME_LEN = 35;
export const UI_FORM_NAME_LEN = 45;
export const UI_MODEL_NAME_LEN = 45;
export const UI_PC_COMPACT_MAX_SIZE = 1220;
export const UI_TABLET_MAX_SIZE = 1024;
export const UI_MC_MAX_SIZE = 768;
export const UI_MC_MIN_SIZE = 375;

export const NUMBER_MAX_LENGTH = 16;

export const VIEW_TYPES = [
  'map',
  'card',
  'chart',
  'calendar'
];