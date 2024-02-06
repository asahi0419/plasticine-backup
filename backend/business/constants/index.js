export const DATE_FORMATS = [
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

export const GLOBAL_DATE_FORMAT = 'global_date_format';
export const DEFAULT_DATE_FORMAT = DATE_FORMATS[0]
export const DEFAULT_DATE_ONLY_FORMAT = DATE_FORMATS[2];
export const DATE_ONLY_FORMATS = [DATE_FORMATS[2], DATE_FORMATS[5], DATE_FORMATS[8], DATE_FORMATS[11], DATE_FORMATS[14]];

export const DEFAULT_AUDIT_TEXT_PATTERN = "Field '${related_field}' changed from '${from}' to '${to}'";
export const DEFAULT_AUDIT_TEXT_LIMIT = 100;

export const PLANNED_TASK_TIMEOUT_COUNTER_LIMIT = 5;
