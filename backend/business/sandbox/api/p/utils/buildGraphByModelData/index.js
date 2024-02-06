import axios from 'axios';
import { isObject, isEmpty } from 'lodash-es';

import logger from '../../../../../logger/index.js';
import { ParamsNotValidError, OverlimitTopologyViewNodesMax } from '../../../../../error/index.js';

export default (sandbox) => async (inJson) => {
  if (!isObject(inJson)) throw new ParamsNotValidError('inJson should be an object in p.utils.buildGraphByModelData()');

  const path = `http://${process.env.SERVICE_TOPOLOGY_HOST}:${process.env.SERVICE_TOPOLOGY_PORT}${process.env.ROOT_ENDPOINT}/topology/build`;
  const account = sandbox.vm.p.currentUser.getAccount();
  const userEmail = account.getValue('email');

  const response = await axios({
    method: 'post',
    url: path,
    data: { inJson, userEmail },
  });
  processError(response.data);
  return response.data;
};

const processError = (data) => {
  if (!isEmpty(data.error)) {
    if (data.error.name == 'OverlimitTopologyViewNodesMax') {
      throw new OverlimitTopologyViewNodesMax(data.error.description);
    }
  }
}