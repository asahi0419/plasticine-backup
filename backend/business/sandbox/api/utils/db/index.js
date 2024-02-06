import callFuncFunction from './call-func/index.js';
import transactionFunc from './transaction/index.js';

export default (sandbox) => {
  return {
    callFunc: callFuncFunction,
    transaction: transactionFunc,
  }
};
