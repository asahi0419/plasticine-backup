import db from '../../data-layer/orm/index.js';
import RecordManager from '../../business/record/manager/index.js';

export default class Record {
  constructor(model, sandbox, mode = 'insecure') {
    this.model = db.getModel(model);
    this.mode = mode;

    this.manager = new RecordManager(this.model, sandbox, mode);
  }

  getAttributes(record = {}) {
    const date = +new Date();
    const alias = `test_${this.model.alias}_${date}`;
    const name = `Test ${this.model.name || this.model.alias} (${date})`;

    const email = `test_${date}@test.com`;
    const password = '1234567890';

    const attributes = {};

    switch (this.model.alias) {
      case 'model':
        attributes.alias = alias;
        attributes.name = name;
        attributes.plural = 'Tests';
        attributes.type = 'custom';
        attributes.template = 'base';
        attributes.access_script = 'true';
        break;
      case 'field':
        attributes.alias = alias;
        attributes.name = name;
        attributes.index = 'none';
        attributes.type = 'string';
        if (record.type === 'array_string') attributes.options = record.options || JSON.stringify({ values: { one: 'One', two: 'Two' } });
        break;
      case 'user':
        attributes.name = name;
        attributes.email = email;
        attributes.password = password;
        attributes.account = { email, password, status: 'active' };
        break;
      case 'account':
        attributes.email = email;
        attributes.password = password;
        attributes.status = 'active';
        break;
      case 'user_group':
        attributes.alias = alias;
        attributes.name = name;
        break;
      case 'action':
        attributes.alias = alias;
        attributes.name = name;
        attributes.server_script = 'true';
        break;
      case 'page':
        attributes.alias = alias;
        attributes.name = name;
        attributes.template = '<div></div>';
        break;
      case 'db_rule':
        attributes.name = name;
        attributes.active = true;
        attributes.order = '0';
        attributes.condition_script = 'true';
        break;
      case 'filter':
        attributes.name = name;
        break;
      case 'view':
        attributes.alias = alias;
        attributes.name = name;
        attributes.type = record.type || 'grid';
        break;
      case 'form':
        attributes.alias = alias;
        attributes.name = name;
        break;
      case 'layout':
        attributes.name = name;
        attributes.type = record.type || 'grid';
        break;
      case 'appearance':
        attributes.name = name;
        attributes.script = 'true';
        break;
      case 'chart':
        attributes.alias = alias;
        attributes.name = name;
        break;
      case 'dashboard':
        attributes.alias = alias;
        attributes.name = name;
        break;
      case 'escalation_rule':
        attributes.name = name;
        attributes.condition_script = 'true';
        attributes.script = 'true';
        attributes.active = true;
        attributes.offset = null;
        attributes.re_enable_after = null;
        break;
      case 'scheduled_task':
        attributes.name = name;
        attributes.active = true;
        attributes.start_at = new Date();
        attributes.script = 'true';
        break;
      case 'extra_fields_attribute':
        attributes.alias = alias;
        attributes.name = name;
        break;
      case 'ip_ban':
        attributes.ip = '0.0.0.0';
        attributes.ban_till = date;
        attributes.attempts = 0;
        attributes.ban_level = 0;
        break;
      case 'session':
        attributes.reason_to_close = null;
        attributes.ip_address = '0.0.0.0';
        attributes.details = '{}';
        break;
      case 'planned_task':
        attributes.timeout_attempts = null;
        attributes.status = 'new';
        attributes.record = null;
      case 'privilege':
        attributes.level = 'admin';
        attributes.owner_type = 'user';
        attributes.owner_id = 1;
      case 'worklog':
        break;
    }

    return attributes;
  }

  async build(record = {}, persistent = false) {
    return this.manager.build({ ...this.getAttributes(record), ...record }, persistent);
  }

  async create(record = {}) {
    return this.manager.create({ ...this.getAttributes(record), ...record });
  }

  async update(record = {}, attributes = {}) {
    return this.manager.update(record, attributes);
  }

  async destroy(record = {}) {
    return this.manager.destroy(record);
  }
};
