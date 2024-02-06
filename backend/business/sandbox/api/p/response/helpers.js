import * as ERRORS from '../../../../error/index.js';

export const SCRIPT_ERRORS_MAP = {
  page: ERRORS.PageScriptError,
  action: ERRORS.ActionScriptError,
  db_rule: ERRORS.DBRuleScriptError,
  web_service: ERRORS.WebServiceScriptError,
};

export const getErrorWrapper = (error = {}, type) => {
  return ERRORS[error.name] || SCRIPT_ERRORS_MAP[type];
};

export const checkScriptErrorType = (stack) => {
  const scriptPath = stack.filter(line => line.match(/SCRIPT_PATH:/)).pop();

  return scriptPath
    ? scriptPath.replace(/^.*SCRIPT_PATH:/, '').replace(/:.*$/, '').split('/')[0]
    : 'default';
};
