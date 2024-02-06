import jwt from 'jsonwebtoken';
import lodash from 'lodash';

import db from '../../../../data-layer/orm/index.js';
import IpBan from '../../../user/ip-ban/index.js';
import logger from '../../../logger/index.js';
import getRequestFunction from '../p/get-request/index.js';
import getUserObjectFunction from '../p/get-user-object.js';
import { createUser } from '../../../user/index.js';
import { getSetting } from '../../../setting/index.js';
import Flags from '../../../record/flags.js';
import { ImeiNotDefinedError, WrongUserCredentialsError } from '../../../error/index.js';

export default ({ request, response }, sandbox) => {
  const getRequest = getRequestFunction({ request });
  const getUserObject = getUserObjectFunction(sandbox);

  const updateDevice = async (device, params) => {
    const {
      device_model,
      operating_system,
      version_changed_on,
      version
    } = params;

    if ((!lodash.isEmpty(device_model) && device.model != device_model) ||
      (!lodash.isEmpty(operating_system) && device.operating_system != operating_system) ||
      (!lodash.isEmpty(version_changed_on) && device.version_changed_on != version_changed_on) ||
      (!lodash.isEmpty(version) && device.mc_version != version)
    ) {
      const flags = new Flags({ check_permission: false });
      return db.model('mc_device', sandbox)
        .updateRecord(device, {
          model: device_model,
          operating_system,
          version_changed_on,
          mc_version: version,
        }, flags);
    }
  }

  return {
    isAuthorized: (email) => {
      const [ schema, token ] = (request.headers.authorization || '').split(' ');
      if (!token) return false;

      try {
        const decoded = jwt.verify(token, process.env.APP_SECRET_ALGORITHM
          ? process.env.APP_SECRET_PUBLIC
          : process.env.APP_SECRET);
        return decoded.email === email;
      } catch (error) {
        logger.error(error);
        return false;
      }
    },

    authenticate: async (account, params = {}) => {
      const options = {
        type: 'auth',
        user: {
          id: account.user.id,
          auth: 'jwt',
          name: account.user.name,
          email: account.user.account.email,
          surname: account.user.surname,
        }, ...params,
      };

      const context = {
        secret: process.env.APP_SECRET,
        options: {}
      };

      if (process.env.APP_SECRET_ALGORITHM) {
        context.secret = process.env.APP_SECRET_PRIVATE;
        context.options.algorithm = process.env.APP_SECRET_ALGORITHM;
      }

      const session = await account.createSession(getRequest(), sandbox);

      options.user.session_id = session.getValue('id');
      options.token = jwt.sign(options.user, context.secret, context.options);

      await response.json({ action: 'auth_user', options });
    },

    createAccount: async (email, password) => {
      const ipBan = new IpBan(getRequest(), sandbox);
      const account = await db.model('account').where({ email }).getOne();

      if (account) throw new WrongUserCredentialsError(sandbox.translate('static.email_is_already_registered'));

      const name = email.substr(0, email.indexOf('@'));
      const user = await createUser({ email, password, name, account: { email, password } });
      const userProxy = await getUserObject(user);

      return userProxy.getAccount();
    },

    findAccountByEmail: async (email, options = {}) => {
      const ipBan = new IpBan(getRequest(), sandbox);
      const account = await db.model('account').where({ email }).getOne();

      if (options.ip_ban) {
        if (!account) await ipBan.process('create', options.ip_ban.type, 'email_is_not_registered');
        await ipBan.process('validate', options.ip_ban.type, 'email_is_not_registered');
      } else {
        if (!account) throw new WrongUserCredentialsError(sandbox.translate('static.email_is_not_registered'));
      }

      const user = await db.model('user').where({ account: account.id }).getOne();
      const userProxy = await getUserObject({ ...user, account });

      return userProxy.getAccount();
    },

    checkMcDevice: async (params, user) => {
      if (user.account.email === process.env.APP_ADMIN_USER) return; // need for stitched proxy admin.

      const {
        device: requestDevice = '',
        old_device = '',
        default_device = '',
        device_model,
        operating_system,
        version_changed_on,
        version
      } = params;
      let device;

      device = await db.model('mc_device').where({ device_id: requestDevice }).getOne();
      if (device) {
        await updateDevice(device, params);
        if ([ 'new', 'active' ].includes(device.state)) return;
        throw new ImeiNotDefinedError();
      }

      device = await db.model('mc_device').where({ device_id: old_device }).getOne();
      if (device) {
        await updateDevice(device, params);
        if ([ 'new', 'active' ].includes(device.state)) {
          return db.model('mc_device').where({ device_id: old_device }).update({ device_id: requestDevice });
        }
        throw new ImeiNotDefinedError();
      }

      const mcSettings = getSetting('mc');

      if (mcSettings.default_imei_activation) {
        device = await db.model('mc_device').where({ device_id: default_device }).getOne();
        if (device) {
          if ([ 'new', 'active' ].includes(device.state)) {
            const newDevice = {
              device_id: requestDevice,
              device_name: `${user.name || ''} ${user.surname || ''}`,
              model: device_model,
              state: 'new',
              operating_system,
              version_changed_on,
              mc_version: version
            };
            return db.model('mc_device', sandbox).createRecord(newDevice, false);
          }
        }
      }

      throw new ImeiNotDefinedError();
    }
  };
};
