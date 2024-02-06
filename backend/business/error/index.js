import { compact, isPlainObject } from 'lodash-es';

export const RecordNotValidError = createError('RecordNotValidError', 400);
export const RecordSaveError = createError('RecordSaveError', 400);
export const ParamsNotValidError = createError('ParamsNotValidError', 400);
export const OtpCodeIsNotValidError = createError('OtpCodeIsNotValidError', 400);
export const QueryBuilderError = createError('QueryBuilderError', 400);
export const TokenExpiredError = createError('TokenExpiredError', 401);
export const AuthenticationError = createError('AuthenticationError', 403);
export const StolenSessionError = createError('StolenSessionError', 403);
export const ExpiredSessionError = createError('ExpiredSessionError', 403);
export const ExpiredSystemError = createError('ExpiredSystemError', 403);
export const WrongUserCredentialsError = createError('WrongUserCredentialsError', 403);
export const NoAccessToViewError = createError('NoAccessToViewError', 403);
export const NoAccessToWebServiceError = createError('NoAccessToWebServiceError', 403);
export const NoAccessToModelError = createError('NoAccessToModelError', 403);
export const NoPermissionsError = createError('NoPermissionsError', 403);
export const ExpiredPasswordError = createError('ExpiredPasswordError', 403);
export const UserStatusBannedError = createError('UserStatusBannedError', 403);
export const AccountBannedError = createError('AccountBannedError', 403);
export const AccountDisabledError = createError('AccountDisabledError', 403);
export const AccountInactiveError = createError('AccountInactiveError', 403);
export const WaitingConfirmationError = createError('WaitingConfirmationError', 403);
export const IpBannedError = createError('IpBannedError', 403);
export const ImeiNotDefinedError = createError('ImeiNotDefinedError', 403);
export const ModelNotFoundError = createError('ModelNotFoundError', 404);
export const FieldNotFoundError = createError('FieldNotFoundError', 404);
export const ViewNotFoundError = createError('ViewNotFoundError', 404);
export const FormNotFoundError = createError('FormNotFoundError', 404);
export const WebServiceNotFoundError = createError('WebServiceNotFoundError', 404);
export const WebSocketNotFoundError = createError('WebSocketNotFoundError', 404);
export const ActionNotFoundError = createError('ActionNotFoundError', 404);
export const RecordNotFoundError = createError('RecordNotFoundError', 404);
export const DataGroupError = createError('DataGroupError', 404);
export const FilterError = createError('FilterError', 500);
export const GlobalScriptError = createError('GlobalScriptError', 500);
export const EscalationPlannerError = createError('EscalationPlannerError', 500);
export const ScheduledPlannerError = createError('ScheduledPlannerError', 500);
export const ScriptError = createError('ScriptError', 500);
export const ScriptTimeoutError = createError('ScriptTimeoutError', 500);
export const SystemError = createError('SystemError', 500);
export const IntegrityError = createError('IntegrityError', 500);
export const EscalationConditionError = createError('EscalationConditionError', 500);
export const EscalationScriptError = createError('EscalationScriptError', 500);
export const EscalationCalculationTimeError = createError('EscalationCalculationTimeError', 500);
export const PageScriptError = createError('PageScriptError', 500);
export const ActionScriptError = createError('ActionScriptError', 500);
export const DBRuleScriptError = createError('DBRuleScriptError', 500);
export const WebServiceScriptError = createError('WebServiceScriptError', 500);
export const ScheduledTaskScriptError = createError('ScheduledTaskScriptError', 500);
export const GlobalReferenceError = createError('GlobalReferenceError', 500);
export const WrongTimeOffsetError = createError('WrongTimeOffsetError', 500);
export const OverlimitTopologyViewNodesMax = createError('OverlimitTopologyViewNodesMax', 500);

export function createError(name, httpStatus) {
  return function ErrorClass(...args) {
    return {
      id: +new Date(),
      name,
      httpStatus,
      description: args[0],
      stack: args[1] || new Error().stack,
      context: args[2],
    };
  };
}

export function wrapError(ErrorClass, context) {
  return (err) => {
    const contextString = isPlainObject(context) ? JSON.stringify(context) : context;
    const newDescription = compact([err.message, err.description, contextString]).join('. ');
    return new ErrorClass(newDescription, err.stack);
  };
}
